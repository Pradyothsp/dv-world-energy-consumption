// Load the data from the JSON file
d3.json("data/world_clean_dataset.json").then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.year = +d.year;
        d.gdp = +d.gdp;
        d.primary_energy_consumption = +d.primary_energy_consumption;
    });

    // Sort the data by primary_energy_consumption in descending order
    data.sort(function(a, b) {
        return b.primary_energy_consumption - a.primary_energy_consumption;
    });

    // Set up the chart dimensions
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create x and y scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const yScaleGDP = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.gdp)])
        .range([height, 0]);

    const yScaleEnergy = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.primary_energy_consumption)])
        .range([height, 0]);

    // Create x and y axes
    const xAxis = d3.axisBottom(xScale);
    const yAxisGDP = d3.axisLeft(yScaleGDP);
    const yAxisEnergy = d3.axisRight(yScaleEnergy);

    // Draw x axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Draw y axis for GDP (left)
    svg.append("g")
        .call(yAxisGDP)
        .attr("class", "axis-left");

    // Draw y axis for primary_energy_consumption (right)
    svg.append("g")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxisEnergy)
        .attr("class", "axis-right");

    // Draw bars for GDP
    svg.selectAll(".bar-gdp")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar-gdp")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScaleGDP(d.gdp))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScaleGDP(d.gdp));

    // Draw line for primary_energy_consumption
    const line = d3.line()
        .x(d => xScale(d.year) + xScale.bandwidth() / 2)
        .y(d => yScaleEnergy(d.primary_energy_consumption));

    svg.append("path")
        .data([data])
        .attr("class", "line-energy")
        .attr("d", line);
});