import React, { useState, useEffect } from 'react';

import axios from 'axios';

import { select } from 'd3-selection';

import { transition } from 'd3-transition';

import './SortingVisualizer.css';

const SortingVisualizer = () => {
  const [array, setArray] = useState([8, 3, 1, 7, 0, 10, 2]); // Default array

  const [isSorting, setIsSorting] = useState(false);

  const [speed, setSpeed] = useState(500); // Speed control

  const [algorithm, setAlgorithm] = useState('quicksort'); // Default algorithm

  useEffect(() => {
    // Initial rendering of the chart and updates on every change of `array`

    updateChart(array, null, []);
  }, [array]);

  const fetchSortedArray = async () => {
    setIsSorting(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/sort', {
        array,

        algorithm,
      });

      animateSorting(response.data.steps);
    } catch (error) {
      console.error('Error fetching sorted data', error);
    }

    setIsSorting(false);
  };

  const animateSorting = (steps) => {
    let currentStep = 0;

    const intervalId = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(intervalId);

        setIsSorting(false);

        return;
      }

      updateChart(
        steps[currentStep].array,

        steps[currentStep].pivot,

        steps[currentStep].compared
      );

      setArray(steps[currentStep].array);

      currentStep++;
    }, speed);
  };

  const updateChart = (data, pivotIndex, comparedIndices) => {
    const svg = select('#chart');

    const chartWidth = svg.node().clientWidth;

    const chartHeight = svg.node().clientHeight;

    const barWidth = chartWidth / data.length;

    const scaleFactor = 5; // Adjust this to control the height scaling of the bars

    // Clear previous bars and labels

    svg.selectAll('*').remove();

    // Create a selection of rectangles for bars

    const bars = svg.selectAll('rect').data(data);

    bars

      .enter()

      .append('rect')

      .merge(bars)

      .transition(transition().duration(speed * 0.5)) // Reduce transition duration for smoother animations

      .attr('x', (d, i) => i * barWidth)

      .attr('y', (d) => {
        const barHeight = Math.max(0, d * scaleFactor); // Ensure non-negative bar height

        return chartHeight - barHeight; // Position the bar within the chart
      })

      .attr('width', barWidth - 2)

      .attr('height', (d) => {
        const barHeight = Math.max(0, d * scaleFactor); // Ensure non-negative bar height

        return barHeight;
      })

      .attr('fill', (d, i) => {
        if (i === pivotIndex) return 'orange'; // Highlight pivot element

        if (comparedIndices && comparedIndices.includes(i)) return 'red'; // Highlight compared elements

        return 'linear-gradient(45deg, #6a5acd, #483d8b)'; // Use a gradient for bars
      });

    bars.exit().remove();

    // Create a selection of text elements for numbers on bars

    const labels = svg.selectAll('text').data(data);

    labels

      .enter()

      .append('text')

      .merge(labels)

      .transition(transition().duration(speed * 0.5)) // Reduce transition duration for smoother animations

      .attr('x', (d, i) => i * barWidth + barWidth / 2) // Center text on the bar

      .attr('y', (d) => {
        const barHeight = Math.max(0, d * scaleFactor); // Ensure non-negative bar height

        return chartHeight - barHeight - 5; // Position above the bar
      })

      .attr('text-anchor', 'middle')

      .attr('fill', '#ffffff') // Use white color for text

      .style('font-family', 'Arial, sans-serif') // Modern font style

      .text((d) => d);

    labels.exit().remove();
  };

  const handleArrayInput = (e) => {
    const input = e.target.value.split(',').map(Number);

    if (input.every((val) => !isNaN(val))) {
      // Ensure all elements are valid numbers

      setArray(input);
    }
  };

  return (
    <div className="sorting-visualizer">
      <header className="header">
        <h1 className="title">✨ Ultimate Sorting Visualizer ✨</h1>

        <p className="description">
          Visualize your favorite sorting algorithms in action!
        </p>
      </header>

      <div className="controls">
        <input
          type="text"
          className="input-array"
          placeholder="8, 3, 1, 7, 0, 10, 2" // Default placeholder
          onChange={handleArrayInput}
          disabled={isSorting}
        />

        <button
          className="btn-sort"
          onClick={fetchSortedArray}
          disabled={isSorting}
        >
          Sort
        </button>

        <select
          className="select-algorithm"
          onChange={(e) => setAlgorithm(e.target.value)}
          disabled={isSorting}
        >
          <option value="quicksort">Quick Sort</option>

          <option value="bubblesort">Bubble Sort</option>

          <option value="mergesort">Merge Sort</option>
        </select>
      </div>

      <div className="speed-control">
        <input
          type="range"
          min="100"
          max="2000"
          value={speed}
          className="speed-slider"
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={isSorting}
        />

        <label className="speed-label">Animation Speed: {speed} ms</label>
      </div>

      <svg id="chart" width="100%" height="300"></svg>
    </div>
  );
};

export default SortingVisualizer;
