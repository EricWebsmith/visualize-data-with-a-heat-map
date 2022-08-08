import { useEffect, useRef } from 'react';
import './Heatmap.css';
import * as d3 from 'd3';
import { temperature } from './temperature';
import * as _ from 'lodash';

export default function Heatmap() {
  const d3Chart = useRef();

  useEffect(() => {
    const width = 1100;
    const height = 600;
    const padding = 50;
    const paddingBottom = 100;

    const data = temperature.monthlyVariance;
    const baseTemperature = temperature.baseTemperature;

    const tooltip = d3
      .select('.visHolder')
      .append('div')
      .attr('id', 'tooltip')
      .style('opacity', 0);

    const overlay = d3
      .select('.visHolder')
      .append('div')
      .attr('class', 'overlay')
      .style('opacity', 0);

    const svg = d3.select(d3Chart.current)
      .attr('width', width)
      .attr('height', height);



    // x
    const minYear = _.minBy(data, d => d.year).year - 1;
    const maxYear = _.maxBy(data, d => d.year).year + 1;
    console.log(minYear, maxYear);
    const xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([padding, width - padding])

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'))

    svg.append('g')
      .attr('transform', `translate(0, ${height - paddingBottom})`)
      .call(xAxis);



    // y
    const yScale = d3
      .scaleBand()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .range([padding, height - paddingBottom])

    const yAxis = d3.axisLeft(yScale)
      .tickFormat((month) => {
        const months = ['Jan', 'Fec', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month];
      })

    svg.append('g')
      .attr('transform', `translate(${padding}, 0)`)
      .call(yAxis);



    // color
    const colors = [
      '#67001f',
      '#b2182b',
      '#d6604d',
      '#f4a582',
      '#fddbc7',
      '#f7f7f7',
      '#d1e5f0',
      '#92c5de',
      '#4393c3',
      '#2166ac',
      '#053061'
    ];

    const variance = data.map(function (val) {
      return val.variance;
    });

    const minTemp = baseTemperature + Math.min.apply(null, variance);
    const maxTemp = baseTemperature + Math.max.apply(null, variance);

    const tempArray = [];
    const step = (maxTemp - minTemp) / colors.length;
    for (let i = 0; i < colors.length; i++) {
      tempArray.push(minTemp + step * i);
    }

    const legendThreshold = d3.scaleThreshold()
      .domain(tempArray)
      .range(colors)

    const legendX = d3
      .scaleLinear()
      .domain([minTemp, maxTemp])
      .range([0, 400])

    const legendXAxis = d3
      .axisBottom()
      .scale(legendX)
      .tickSize(10, 0)
      .tickValues(tempArray)
      .tickFormat(d3.format('.1f'))

    const legendBottom = height - (padding) / 2;
    const legend = svg
      .append('g')
      .classed('legend', true)
      .attr('id', 'legend')
      .attr('transform', `translate(0, ${legendBottom})`)
      .call(legendXAxis);


    const rectWidth = legendX(step) - legendX(0);
    const rectY = legendBottom - rectWidth;
    const baseX = legendX(minTemp)
    for (let i = 0; i < colors.length; i++) {
      svg.append('rect')
        .attr('x', baseX + i * rectWidth)
        .attr('y', rectY)
        .attr('height', rectWidth)
        .attr('width', rectWidth)
        .style('fill', colors[colors.length - i - 1]);
      // .attr('fill', 'red')
    }

    // heat map

    function getColor(temp) {
      let colorIndex = 0;
      for (let i = 1; i < tempArray.length; i++) {
        if (temp > tempArray[i]) {
          colorIndex = i;
        }
      }
      return colors[colors.length - 1 - colorIndex];
    }

    const barWidth = xScale(1) - xScale(0);
    const barHeight = yScale(1) - yScale(0);

    console.log('month')
    for (let i = 1; i <= 12; i++) {
      console.log(yScale(i - 1));
    }

    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.year))
      .attr('y', d => yScale(d.month - 1))
      .attr('width', barWidth)
      .attr('height', barHeight)
      .style('fill', d => getColor(baseTemperature + d.variance))
      .on('mouseover', function (event, d) {
        var date = new Date(d.year, d.month);
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(
          "<div><span class='date'>" +
          d3.timeFormat('%Y - %B')(date) +
          '</span>' +
          '<br />' +
          "<span class='temperature'>" +
          d3.format('.1f')(baseTemperature + d.variance) +
          '&#8451;' +
          '</span></div>'
        )
        .style('left', xScale(d.year) + 30 + 'px')
        .style('top', yScale(d.month - 1) + 5 + 'px')

      })
      .on('mouseout', function () {
        tooltip.transition().duration(200).style('opacity', 0);
        overlay.transition().duration(200).style('opacity', 0);
      });
  }, []);

  return (
    <div className="main">

      <div className="container">
        <h1 id='title'>Monthly Global Land-Surface Temperature</h1>
        <p id='description'>1753 - 2015: base temperature 8.66℃</p>
        <div className="visHolder">
          <svg ref={d3Chart}></svg>
        </div>
      </div>

    </div>
  );
}