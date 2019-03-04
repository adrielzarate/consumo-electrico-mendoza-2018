let csvFilePath = 'demanda-maxima-enero-marzo-2018.csv';

(function getCSVdata(csvFile) {
    d3.dsv(';',csvFile, function(d) {
        const date = d.demanda_fecha_dia;
        const temp = d.temperatura_grados_centigrados_momento_demanda;
        const pow = d['demanda_potencia_ mega_watt'];
        if(date != '' && temp != '' && pow != '') {
            return { date, temp, pow };
        }
    }).then(function(data) {
        // console.log(data);
        d3Draw(data);
    });
})(csvFilePath);

const chartConfig = {
    w: 800,
    h: 400
};

function d3Draw(data) {


    // SETTING DATA

    const minDate = data[0].date.split('/');
    const maxDate = data[data.length-1].date.split('/');

    const dateLimits = {
        min: new Date( minDate[2], minDate[1] - 1, minDate[0] ),
        max: new Date( maxDate[2], maxDate[1] - 1, maxDate[0] )
    };

    const color = d3.scaleLinear()
        .domain([20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40])
        .range(d3.schemeOrRd[9]);


    // SVG START

    const svg = d3.select('body')
        .append('svg')
        .attr('width', chartConfig.w)
        .attr('height', chartConfig.h);


    // SCALE

    const xScale = d3.scaleTime()
        .domain([dateLimits.min, dateLimits.max])
        .range([ 30, chartConfig.w - 30 ]);

    const yScale = d3.scaleLinear()
        .domain([20, 40])
        .rangeRound([ chartConfig.h - 60, 10 ]);


    // LINE

    const line = d3.line()
        .x(function(d, i) {
            const parsedDate = d.date.split('/');
            const date = new Date( parsedDate[2], parsedDate[1] - 1, parsedDate[0] );
            return xScale(date);
            // return xScale(i);
        })
        .y(function(d) {
            const temp = d.temp.replace(',', '.');
            return yScale(temp);
        })
        .curve(d3.curveMonotoneX);

    svg.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', line);

    // CIRCLES

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            const parsedDate = d.date.split('/');
            const date = new Date( parsedDate[2], parsedDate[1] - 1, parsedDate[0] );
            return xScale(date);
        })
        .attr('cy', function(d) {
            const temp = d.temp.replace(',', '.');
            return yScale(temp);
        })
        .attr('r', function(d) {
            return d.pow * 0.01;
        })
        .attr("fill", function(d) {
            const temp = d.temp.replace(',', '.');
            return color(temp);
        });


    // TOOLTIPS

    svg.selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .text(function(d) {
            return d.date + ' - ' + d.temp;
        })
        .attr('x', function(d) {
            const parsedDate = d.date.split('/');
            const date = new Date( parsedDate[2], parsedDate[1] - 1, parsedDate[0] );
            return xScale(date);
        })
        .attr('y', function(d) {
            const temp = d.temp.replace(',', '.');
            return yScale(temp);
        })
        .attr('font-family', 'sans-serif')
        .attr('font-size', '11px')
        .attr('fill', 'red');

    // AXIS

    const xAxis = d3.axisBottom(xScale).ticks(16).tickFormat(d3.timeFormat('%b %d'));

    svg.append('g')
        .attr('transform', 'translate(0,' + (chartConfig.h - 50 ) + ')')
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-12px')
        .attr('dy', '-0px')
        .attr('transform', 'rotate(-65)');


    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .call(yAxis)
        .attr('transform', 'translate(' + 30 + ', 10)');

}