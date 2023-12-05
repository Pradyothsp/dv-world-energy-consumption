anychart.onDocumentReady(function () {

    // Load data from CSV file
    anychart.data.loadCsvFile('data/world_clean_dataset.csv', function (data) {

        // create a pareto chart
        var chart = anychart.pareto();
        // feed the data into the chart
        chart.data(data);

        // set the chart title
        chart.title('Number of Deaths for 10 Leading Causes of Death in U.S. in 2019');
        // set the measure y axis title
        chart.yAxis(0).title('Year');
        // set the cumulative percentage y axis title
        chart.yAxis(1).title('Cumulative percentage');

        // use one of the pre-built palettes for coloring
        chart.palette(anychart.palettes.earth);

        // configure the visual settings of the first series
        chart.getSeries(0).normal().fill("#c98411", 0.3);
        chart.getSeries(0).hovered().fill("#c98411", 0.1);
        chart.getSeries(0).selected().fill("#c98411", 0.5);
        chart.getSeries(0).normal().hatchFill("forward-diagonal", "#c98411", 1, 15);
        chart.getSeries(0).hovered().hatchFill("forward-diagonal", "#c98411", 1, 15);
        chart.getSeries(0).selected().hatchFill("forward-diagonal", "#c98411", 1, 15);
        chart.getSeries(0).normal().stroke("#c98411");
        chart.getSeries(0).hovered().stroke("#c98411", 2);
        chart.getSeries(0).selected().stroke("#c98411", 4);

        // configure the visual settings of the second series
        chart.getSeries(1).normal().stroke("#991e00", 4, "4 4", "round");

        // configure the pareto column series tooltip format
        var column = chart.getSeriesAt(0);
        column.tooltip().format('Value: {%Value}');

        // configure the pareto column series tooltip format
        var line = chart.getSeriesAt(1);
        line
            .tooltip()
            .format('Cumulative Frequency: {%CF}% \n Relative Frequency: {%RF}%');

        // set the pareto line series labels
        var line = chart.getSeriesAt(1);
        line.labels().enabled(true).anchor('right-bottom').format('{%CF}%');

        // turn on the crosshair and set settings
        chart.crosshair().enabled(true).xLabel(false);

        // set the chart container id
        chart.container('container1');
        // draw the chart
        chart.draw();
    });
});
