import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const CommunityNetworkVisualizer = ({ members = [], flows = [], gaps = [] }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!members.length || !svgRef.current) return;

    const width = containerRef.current?.clientWidth || 900;
    const height = 600;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Color palette for materials
    const materialColors = {
      ORGANIC: '#5C6E45',   // moss
      CARDBOARD: '#C79A5C', // kraft
      TEXTILE: '#A4502E',   // rust
      OTHER: '#241B14',     // loam
    };

    // Prepare Node & Link Data
    const nodes = members.map(m => ({ ...m, x: Math.random() * width, y: Math.random() * height }));
    const links = flows.map(f => ({ ...f }));
    const gapLinks = gaps.map(g => ({
      source: g.producerId,
      target: g.consumerId,
      isGap: true,
      potentialMaterial: g.potentialMaterial,
    }));

    const allLinks = [...links, ...gapLinks];

    // D3 Force Simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(allLinks).id(d => d.id).distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Render Symbiosis Gap Dashed Lines
    const gapLine = svg
      .append('g')
      .selectAll('line')
      .data(gapLinks)
      .enter()
      .append('line')
      .attr('stroke', '#C79A5C')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,5');

    // Render Active Material Flow Edges
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => materialColors[d.materialType] || materialColors.ORGANIC)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', d => Math.max(2, Math.min(8, (d.volumeKg || 30) / 10)));

    // Animated Slow Pulses Traveling along Edges
    const pulses = svg
      .append('g')
      .selectAll('circle')
      .data(links)
      .enter()
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#F3EEE3')
      .attr('stroke', d => materialColors[d.materialType] || materialColors.ORGANIC)
      .attr('stroke-width', 2);

    // Render Nodes (Members)
    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => setSelectedNode(d));

    // Node Circles
    node
      .append('circle')
      .attr('r', d => (d.role === 'PRODUCER' ? 18 : d.role === 'CONSUMER' ? 18 : 14))
      .attr('fill', d =>
        d.role === 'PRODUCER' ? '#5C6E45' : d.role === 'CONSUMER' ? '#C79A5C' : '#A4502E'
      )
      .attr('stroke', '#F3EEE3')
      .attr('stroke-width', 2)
      .attr('shadow-sm', true);

    // Node Icons / Labels
    node
      .append('text')
      .text(d => d.orgName || d.name)
      .attr('x', 24)
      .attr('y', 4)
      .attr('fill', 'var(--color-loam)')
      .attr('font-family', 'IBM Plex Sans')
      .attr('font-size', '11px')
      .attr('font-weight', '600');

    // Simulation Ticks
    let pulseProgress = 0;
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      gapLine
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);

      // Pulse movement loop
      pulseProgress = (pulseProgress + 0.005) % 1;
      pulses
        .attr('cx', d => d.source.x + (d.target.x - d.source.x) * pulseProgress)
        .attr('cy', d => d.source.y + (d.target.y - d.source.y) * pulseProgress);
    });

    return () => simulation.stop();
  }, [members, flows, gaps]);

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-mycelium/40 rounded-xl border border-loam/15 overflow-hidden shadow-inner">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Selected Node Drawer */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-mycelium border border-loam/20 p-4 rounded-lg shadow-xl font-mono text-xs max-w-xs animate-in fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-loam/15">
            <span className="font-bold text-moss">{selectedNode.role}</span>
            <button onClick={() => setSelectedNode(null)} className="text-loam/60 hover:text-loam">✕</button>
          </div>
          <div className="mt-2 space-y-1 font-sans">
            <div className="font-bold text-sm text-loam">{selectedNode.orgName || selectedNode.name}</div>
            <div className="text-xs text-loam/70">{selectedNode.address || 'New York, NY'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
