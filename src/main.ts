import { initScene } from './graph';
import { parseCSV } from './csv';

fetch('/graph.csv')
  .then(response => response.text())
  .then(csvData => {
    const graphData = parseCSV(csvData);
    initScene(graphData);
  });