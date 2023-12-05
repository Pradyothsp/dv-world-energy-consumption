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

    // Define a mapping for consumption types
    const consumptionTypeMapping = {
        "primary_energy_consumption": "Primary Energy Consumption",
        "coal_cons_per_capita": "Coal Consumption per Capita",
        "gas_energy_per_capita": "Gas Energy Consumption per Capita",
        "hydro_elec_per_capita": "Hydroelectric Energy Consumption per Capita",
        "low_carbon_energy_per_capita": "Low Carbon Energy Consumption per Capita",
        "oil_energy_per_capita": "Oil Energy Consumption per Capita",
        "renewables_energy_per_capita": "Renewables Energy Consumption per Capita"
        // "renewables_consumption": "Renewables Consumption",
        // "fossil_fuel_consumption": "Fossil Fuel Consumption"
    };

    // Reverse mapping for line chart processing
    const consumptionTypeInternalMapping = Object.fromEntries(
        Object.entries(consumptionTypeMapping).map(([key, value]) => [value, key])
    );

    // Use the mapped names for dropdown options
    const consumptionSelect = Object.values(consumptionTypeMapping);



    // After populating the consumption type select element
    console.log("Consumption Type Options:", consumptionSelect);


    // Populate the select element with country options
    const select = d3.select("#countrySelect")
        .selectAll("option")
        .data(countries)
        .enter()
        .append("option")
        .text(d => d);

    // Populate the consumption type select element
    const consumptionSelectElement = d3.select("#consumptionSelect")
        .selectAll("option")
        .data(consumptionSelect)
        .enter()
        .append("option")
        .text(d => d);

    // Set up the chart dimensions
    const margin = { top: 30, right: 70, bottom: 70, left: 150 };
    const width = 1200 - margin.left - margin.right;
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
    function updateChart(selectedCountry, selectedType) {
        console.log("Updating chart for:", selectedCountry, "with consumption type:", selectedType);

        const filteredData = data.filter(d => d.country === selectedCountry);

        console.log("Filtered Data:", filteredData);

        // Update x and y scales for the filtered data
        xScale.domain(filteredData.map(d => d.year));
        yScaleGDP.domain([0, d3.max(filteredData, d => d.gdp)]);
        // yScaleEnergy.domain([0, d3.max(filteredData, d => d.primary_energy_consumption)]);
        yScaleEnergy.domain([0, d3.max(filteredData, d => +d[selectedType])]);

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
            .attr("y", height) // Start the bars at the bottom of the chart
            .attr("width", xScale.bandwidth())
            .attr("height", 0) // Set initial height to 0
            .style("fill", d => colorScale(d.primary_energy_consumption))
            .on("mouseover", function (event, d) {
                const tooltipData = filteredData[d];
                // Show tooltip on mouseover
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(
                    "GDP: $ " + (+tooltipData.gdp).toLocaleString() +
                    "<br>Energy Consumption: " + (+tooltipData.primary_energy_consumption).toLocaleString() + " terawatt-hours" +
                    "<br>Year: " + tooltipData.year
                )
                    .style("left", (event.pageX + 10) + "px") // Adjust position relative to cursor
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function (event, d) {
                // Update the position of the tooltip with the mouse movement
                const [x, y] = d3.mouse(this.parentNode);
                tooltip.style("left", (x + 100) + "px")
                    .style("top", (y + 250) + "px");
            })
            .on("mouseout", function (d) {
                // Hide tooltip on mouseout
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition() // Add a transition for a smoother update
            .duration(500) // Set the duration of the transition
            .attr("y", d => yScaleGDP(d.gdp))
            .attr("height", d => height - yScaleGDP(d.gdp));

        // Draw line for primary_energy_consumption with color grading
        const line = d3.line()
            .x(d => xScale(d.year) + xScale.bandwidth() / 2)
            .y(d => yScaleEnergy(+d[selectedType]));

        svg.append("path")
            .data([filteredData])
            .attr("class", "line-energy")
            .attr("d", line)
            .style("stroke-width", 2)  // Set the stroke width to 2 pixels
            .style("stroke", "orange");  // Set the stroke color to black

        console.log("Chart updated!");
    }

    // Initial update with the first country in the list
    updateChart(countries[0], consumptionTypeInternalMapping[consumptionSelect[0]]);

    // Add event listener to update the chart when the user selects a different country
    d3.select("#countrySelect").on("change", function () {
        const selectedCountry = d3.select(this).property("value");
        const selectedTypeDisplay = d3.select("#consumptionSelect").property("value");
        const selectedTypeInternal = consumptionTypeInternalMapping[selectedTypeDisplay];
        updateChart(selectedCountry, selectedTypeInternal, selectedTypeDisplay);
    });

    d3.select("#consumptionSelect").on("change", function () {
        const selectedTypeDisplay = d3.select(this).property("value");
        const selectedTypeInternal = consumptionTypeInternalMapping[selectedTypeDisplay];
        const selectedCountry = d3.select("#countrySelect").property("value");
        updateChart(selectedCountry, selectedTypeInternal);
    });


    // Create a tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add a title to the chart
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .text("GDP and Primary Energy Consumption");

    // Add x axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Year");

    // Add y axis label for GDP (left)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -100)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("GDP");

    // Add y axis label for primary_energy_consumption (right)
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", width + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Primary Energy Consumption (in terawatt-hours)");
});
