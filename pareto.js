// Load the data from the JSON file
d3.json("data/world_clean_dataset.json").then(function (data) {
    // Convert string values to numbers
    data.forEach(function (d) {
        d.year = +d.year;
        d.gdp = +d.gdp;
        d.primary_energy_consumption = +d.primary_energy_consumption;
    });

    // Get unique country names
    const countries = Array.from(new Set(data.map(d => d.country)));

    // After populating the select element with country options
    console.log("Dropdown Options:", countries);

    // Populate the select element with country options
    const select = d3.select("#countrySelect")
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d);

    // Set up the chart dimensions
    const margin = { top: 30, right: 50, bottom: 70, left: 100 };
    const width = 1500 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create color scale for bars and line
    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.primary_energy_consumption)])
        .range(['lightblue', 'steelblue']); // Adjust colors as needed

    // Create SVG element
    const svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create x and y scales (initial scales for all data)
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.1)
        .paddingOuter(0.2);  // Add padding to the outer edges

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
        .call(xAxis)
        .attr("class", "axis-bottom"); // Add a class for styling

    /// Draw y axis for GDP (left)
    svg.append("g")
        .call(yAxisGDP)
        .attr("class", "axis-left")
        .selectAll(".tick text")
        .style("text-anchor", "end")
        .attr("dy", -1) // Adjust the vertical position of tick labels
        .attr("dx", -4); // Adjust the horizontal position of tick labels


    // Draw y axis for primary_energy_consumption (right)
    svg.append("g")
        .attr("transform", "translate(" + width + ", 0)")
        .call(yAxisEnergy)
        .attr("class", "axis-right"); // Add a class for styling

    // Function to update the chart based on the selected country
    function updateChart(selectedCountry) {
        console.log("Updating chart for:", selectedCountry);

        const filteredData = data.filter(d => d.country === selectedCountry);

        console.log("Filtered Data:", filteredData);

        // Update x and y scales for the filtered data
        xScale.domain(filteredData.map(d => d.year));
        yScaleGDP.domain([0, d3.max(filteredData, d => d.gdp)]);
        yScaleEnergy.domain([0, d3.max(filteredData, d => d.primary_energy_consumption)]);

        console.log("X Scale Domain:", xScale.domain());
        console.log("Y Scale GDP Domain:", yScaleGDP.domain());
        console.log("Y Scale Energy Domain:", yScaleEnergy.domain());

        // Update x and y axes with transitions
        svg.select(".axis-bottom")
            .transition()
            .duration(500)
            .call(xAxis);

        svg.select(".axis-left")
            .transition()
            .duration(500)
            .call(yAxisGDP);

        svg.select(".axis-right")
            .transition()
            .duration(500)
            .call(yAxisEnergy);

        // Remove existing chart elements
        svg.selectAll(".bar-gdp").remove();
        svg.selectAll(".line-energy").remove();

        // Draw bars for GDP with color grading and tooltip
        const bars = svg.selectAll(".bar-gdp")
            .data(filteredData)
            .enter().append("rect")
            .attr("class", "bar-gdp")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScaleGDP(d.gdp))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScaleGDP(d.gdp))
            .style("fill", d => colorScale(d.primary_energy_consumption))
            .on("mouseover", function (event, d) {
                const tooltipData = filteredData[d];
                // Show tooltip on mouseover
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("GDP: " + (+tooltipData.gdp).toLocaleString() + "<br>Energy Consumption: " + (+tooltipData.primary_energy_consumption).toLocaleString())
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                // Hide tooltip on mouseout
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition() // Add a transition for a smoother update
            .duration(500); // Set the duration of the transition
        // Draw line for primary_energy_consumption with color grading
        const line = d3.line()
            .x(d => xScale(d.year) + xScale.bandwidth() / 2)
            .y(d => yScaleEnergy(d.primary_energy_consumption));

        svg.append("path")
            .data([filteredData])
            .attr("class", "line-energy")
            .attr("d", line)
            .style("stroke-width", 2)  // Set the stroke width to 2 pixels
            .style("stroke", "orange");  // Set the stroke color to black

        console.log("Chart updated!");
    }

    // Initial update with the first country in the list
    updateChart(countries[0]);

    // Add event listener to update the chart when the user selects a different country
    d3.select("#countrySelect").on("change", function () {
        const selectedCountry = d3.select(this).property("value");
        updateChart(selectedCountry);
    });

    // Create a tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
});
