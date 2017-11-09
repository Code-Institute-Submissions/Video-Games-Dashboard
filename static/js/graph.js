queue()
    .defer(d3.json, "/videoGames/projects")
    .await(makeGraphs);

function makeGraphs(error, videoGamesProjects) {
    if (error) {
        console.error("makeGraphs error on receiving dataset:", error.statusText);
        throw error;
    }

    // data format
    var dateFormat = d3.time.format("%Y");
    videoGamesProjects.forEach(function (d) {
        d["year"] = d["year"].toFixed();
        d["year"] = dateFormat.parse(d["year"]);
        d["global_sales"] = +d["global_sales"];
        d["other_sales"] = +d["other_sales"];
        d["NA_sales"] = +d["NA_sales"];
        d["EU_sales"] = +d["EU_sales"];
        d["JP_sales"] = +d["JP_sales"];
        d["critic_score"] = +d["critic_score"];
        d["user_score"] = +d["user_score"];
    });

    // Crossfilter instance
    var ndx = crossfilter(videoGamesProjects);

    //define dimensions
    var nameDim = ndx.dimension(function (d) {return d["name"]; });
    var platformDim = ndx.dimension(function (d) {return d["platform"]; });
    var yearDim = ndx.dimension(function (d) {return d["year"]; });
    var genreDim = ndx.dimension(function (d) {return d["genre"]; });
    var globalSalesDim = ndx.dimension(function (d) {return d["global_sales"]; });
    var ratingDim = ndx.dimension(function(d){return d["rating"]; });

    // metrics
    var numProjectsByName = nameDim.group();
    var numProjectsByPlatform = platformDim.group();
    var numProjectsByGenre = genreDim.group();
    var numProjectsByRating = ratingDim.group();

     // All
    var all = ndx.groupAll();

    // Reduce
    var totalSales = ndx.groupAll().reduceSum(function(d) {return d["global_sales"]; });
    var totalNAsalesByYear = yearDim.group().reduceSum(function(d) {return d["NA_sales"]; });
    var totalEUsalesByYear = yearDim.group().reduceSum(function(d) {return d["EU_sales"]; });
    var totalJPsalesByYear = yearDim.group().reduceSum(function(d) {return d["JP_sales"]; });
    var totalOtherSalesByYear = yearDim.group().reduceSum(function(d) {return d["other_sales"]; });
    var totalReleasesByPlatform = numProjectsByPlatform.reduceCount(function (d) {return d["name"]; });
    var totalNAsalesByGenre = genreDim.group().reduceSum(function(d) {return d["NA_sales"]; });
    var totalEUsalesByGenre = genreDim.group().reduceSum(function(d) {return d["EU_sales"]; });
    var totalJPsalesByGenre = genreDim.group().reduceSum(function(d) {return d["JP_sales"]; });
    var totalOtherSalesGenre = genreDim.group().reduceSum(function(d) {return d["other_sales"]; });
    var topGamesByGlobalSales= numProjectsByName.reduceSum(function (d) {return d["global_sales"]; });
    var topGamesByCriticScore = nameDim.group().reduceSum(function(d) {return d["critic_score"]; });
    var topGamesByUserScore = nameDim.group().reduceSum(function(d) {return d["user_score"]; });

    // Max and Min
    var minDate = yearDim.bottom(1)[0]["year"];
    var maxDate = yearDim.top(1)[0]["year"];

    var minGlobalSale = globalSalesDim.bottom(1)[0]["global_sale"];
    var maxGlobalSale = globalSalesDim.top(1)[0]["global_sale"];

    // Charts in  main.html
    var salesChart = dc.lineChart("#sales-line-chart");
    var ratingChart = dc.pieChart("#rating-pie-chart");
    var volumeGamesChart = dc.barChart("#volume-games-line-chart");
    var salesND = dc.numberDisplay("#sales-nd");
    var gamesND = dc.numberDisplay("#games-nd");
    var platformReleasesChart = dc.barChart("#releases-platform-bar-chart");
    var salesRegionGenreChart = dc.barChart("#sales-by-region-genre-chart");
    var topGamesBySalesChart = dc.rowChart("#top-games-sales-row-chart");
    var topGamesByCriticScoreChart = dc.rowChart("#top-games-critic-score-row-chart");
    var topGamesByUserScoreChart = dc.rowChart("#top-games-user-score-row-chart");

    // drop down select fields
   dc.selectMenu("#genre-menu-select-main")
        .width(900)
        .height(200)
        .dimension(genreDim)
        .group(numProjectsByGenre);
    dc.selectMenu("#platform-menu-select-main")
        .width(900)
        .height(200)
        .dimension(platformDim)
        .group(numProjectsByPlatform);
    dc.selectMenu("#name-menu-select-main")
        .width(900)
        .height(200)
        .dimension(nameDim)
        .group(numProjectsByName);

    // sales on region chart
    salesChart
        .width(690)
        .height(130)
        .margins({top: 5, right: 10, bottom: 20, left: 40})
        .dimension(yearDim)
        .mouseZoomable(true)
        .brushOn(false)
        .rangeChart(volumeGamesChart)
        .transitionDuration(500)
        .group(totalEUsalesByYear, "Europe")
        .stack(totalJPsalesByYear, "Japan")
        .stack(totalOtherSalesByYear, "Other")
        .stack(totalNAsalesByYear, "North America")
        .renderArea(true)
        .elasticY(true)
        .ordinalColors(["#A5A8AA", "#F26522", "#676766", "#47ACB1", "#ADD5D7" ])
        .legend(dc.legend().x(60).y(5).itemHeight(13).gap(5))
        .x(d3.time.scale().domain([minDate,maxDate]))
        .y(d3.time.scale().domain([minGlobalSale, maxGlobalSale]))
        .yAxisLabel("Sales in mil $")
        .yAxis().ticks(7);

    // number of games per year
     volumeGamesChart
        .width(690)
        .height(50)
        .margins({top: 5, right: 10, bottom: 20, left: 40})
        .dimension(yearDim)
        .group(totalOtherSalesByYear)
        .elasticX(true)
        .centerBar(true)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .round(d3.time.year.round)
        .xUnits(d3.time.years)
        .ordinalColors(["#A5A8AA"])
        .yAxisLabel("Total Sales");

    // Rating pie chart
    ratingChart
        .width(350)
        .height(200)
        .innerRadius(40)
        .slicesCap(8)
        .dimension(ratingDim)
        .group(numProjectsByRating)
        .colors(d3.scale.ordinal().range(["#47ACB1", "#F26522", "#F9AA7B", "#A5A8AA", "#676766", "#ADD5D7", "#FFE8AF", "#FFCD33"]))
        .transitionDuration(700);

    // game releases by platform chart
    platformReleasesChart
        .width(700)
        .height(200)
        .margins({top: 5, right: 10, bottom: 35, left: 40})
        .dimension(platformDim)
        .group(totalReleasesByPlatform)
        .transitionDuration(650)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Platform")
        .yAxisLabel("Number of games")
        .renderTitle(true)
        .ordinalColors(["#676766"])
        .yAxis().ticks(7);

     // the best selling games in the world row chart    // game sales by region and genre
     salesRegionGenreChart
        .width(550)
        .height(200)
        .margins({top: 5, right: 10, bottom: 40, left: 40})
        .dimension(genreDim)
        .group(totalNAsalesByGenre, "North America")
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .stack(totalOtherSalesGenre, "Other")
        .stack(totalJPsalesByGenre, "Japan")
        .stack(totalEUsalesByGenre, "Europe")
        .transitionDuration(650)
        .renderTitle(true)
        .xAxisLabel("Genre")
        .yAxisLabel("Sales in mil USD")
        .ordinalColors(["#47ACB1", "#F26522", "#F9AA7B", "#A5A8AA", "#676766", "#ADD5D7", "#FFE8AF", "#FFCD33"])
        .legend(dc.legend().x(95).y(10).itemHeight(13).gap(5));

     topGamesBySalesChart
        .width(350)
        .height(200)
        .ordering(function(d) { return -d.value; })
        .dimension(nameDim)
        .ordinalColors(["#47ACB1", "#F26522", "#F9AA7B", "#A5A8AA", "#676766", "#ADD5D7", "#FFE8AF", "#FFCD33"])
        .group(topGamesByGlobalSales)
        .rowsCap(7)
        .othersGrouper(false)
        .xAxis().ticks(4);

     // the best rated games by critics row chart
     topGamesByCriticScoreChart
        .width(250)
        .height(200)
        .ordering(function(d) { return -d.value; })
        .dimension(nameDim)
        .ordinalColors(["#47ACB1", "#F26522", "#F9AA7B", "#A5A8AA", "#676766", "#ADD5D7", "#FFE8AF", "#FFCD33"])
        .group(topGamesByCriticScore)
        .rowsCap(7)
        .othersGrouper(false)
        .xAxis().ticks(4);

     // the best rated games by critics row chart
     topGamesByUserScoreChart
        .width(250)
        .height(200)
        .ordering(function(d) { return -d.value; })
        .dimension(nameDim)
        .ordinalColors(["#47ACB1", "#F26522", "#F9AA7B", "#A5A8AA", "#676766", "#ADD5D7", "#FFE8AF", "#FFCD33"])
        .group(topGamesByUserScore)
        .rowsCap(7)
        .othersGrouper(false)
        .xAxis().ticks(4);

    // Total sales number display
    salesND
        .formatNumber(d3.format("$.3s"))
        .height(200)
        .valueAccessor(function (d) {
            return d;
        })
        .group(totalSales);

    // Number of games (2009-2017) displayed
    gamesND
        .formatNumber(d3.format("d"))
        .height(200)
        .valueAccessor(function (d) {
            return d;
        })
        .group(all);
    dc.dataTable("#data-table")
        .width(650)
        .height(800)
        .dimension(nameDim)
        .group(function(d) {return d["name"];})
        .columns([
            function(d) {return d.name;},
            function(d) {return d.platform;},
            function(d) {return d.year;},
            function(d) {return d.genre;},
            function(d) {return d.NA_sales;},
            function(d) {return d.EU_sales;},
            function(d) {return d.JP_sales;},
            function(d) {return d.other_sales;},
            function(d) {return d.global_sales;},
            function(d) {return d.critic_score;},
            function(d) {return d.user_score;},
            function(d) {return d.user_count;},
            function(d) {return d.developer;},
            function(d) {return d.rating;}
        ])
        .sortBy(function(d){ return d["name"]; })
        .order(d3.descending);

   dc.renderAll();
}


