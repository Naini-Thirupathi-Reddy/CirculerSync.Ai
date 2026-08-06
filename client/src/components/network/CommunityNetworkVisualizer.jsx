import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export const CommunityNetworkVisualizer = ({ members = [], flows = [], gaps = [] }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = 550;

    // Clear previous SVG
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Material Color Map
    const materialColors = {
      ORGANIC: '#5C6E45',   // moss
      CARDBOARD: '#C79A5C', // kraft
      TEXTILE: '#A4502E',   // rust
      OTHER: '#241B14',     // loam
    };

    // Prepare Node & Link Data
    const nodeMap = new Map();
    const nodes = (members.length > 0 ? members : [
      { id: 'user-1', orgName: 'GreenBean Cafe & Bakery', role: 'PRODUCER', address: '142 Mercer St, NY' },
      { id: 'user-2', orgName: 'Roasters Choice Coffee', role: 'PRODUCER', address: '202 Lafayette St, NY' },
      { id: 'user-3', orgName: 'Craft Harvest Bistro', role: 'PRODUCER', address: '55 Spring St, NY' },
      { id: 'user-7', orgName: 'Mycelium Magic Mushrooms', role: 'CONSUMER', address: '88 Broad St, NY' },
      { id: 'user-8', orgName: 'City Farm Urban Agriculture', role: 'CONSUMER', address: '45 Grand St, NY' },
      { id: 'user-9', orgName: 'EcoBox Sustainable Packaging', role: 'CONSUMER', address: '12 Mott St, NY' },
      { id: 'user-11', orgName: 'Swift Eco Logistics', role: 'LOGISTICS', address: '75 Hudson St, NY' },
    ]).map(m => {
      const node = { ...m, x: width / 2 + (Math.random() - 0.5) * 300, y: height / 2 + (Math.random() - 0.5) * 300 };
      nodeMap.set(node.id, node);
      return node;
    });

    const activeFlows = flows.length > 0 ? flows : [
      { id: 'f-1', source: 'user-1', target: 'user-7', materialType: 'ORGANIC', volumeKg: 45 },
      { id: 'f-2', source: 'user-2', target: 'user-8', materialType: 'ORGANIC', volumeKg: 60 },
      { id: 'f-3', source: 'user-3', target: 'user-9', materialType: 'CARDBOARD', volumeKg: 85 },
    ];

    const activeGaps = gaps.length > 0 ? gaps : [
      { id: 'g-1', producerId: 'user-2', consumerId: 'user-7', potentialMaterial: 'Coffee Chaff Substrate' },
    ];

    const links = activeFlows
      .filter(f => nodeMap.has(f.source) && nodeMap.has(f.target))
      .map(f => ({ source: f.source, target: f.target, materialType: f.materialType, volumeKg: f.volumeKg }));

    const gapLinks = activeGaps
      .filter(g => nodeMap.has(g.producerId || g.source) && nodeMap.has(g.consumerId || g.target))
      .map(g => ({ source: g.producerId || g.source, target: g.consumerId || g.target, isGap: true }));

    const allLinks = [...links, ...gapLinks];

    // D3 Force Simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(allLinks).id(d => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(45));

    // Render Symbiosis Gap Dashed Lines
    const gapLine = svg
      .append('g')
      .selectAll('line')
      .data(gapLinks)
      .enter()
      .append('line')
      .attr('stroke', '#C79A5C')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '6,6');

    // Render Active Material Flow Edges
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', d => materialColors[d.materialType] || '#5C6E45')
      .attr('stroke-opacity', 0.85)
      .attr('stroke-width', d => Math.max(3, Math.min(8, (d.volumeKg || 40) / 10)));

    // Animated Pulses along edges
    const pulses = svg
      .append('g')
      .selectAll('circle')
      .data(links)
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#F7F5F0')
      .attr('stroke', d => materialColors[d.materialType] || '#5C6E45')
      .attr('stroke-width', 2);

    // Render Nodes (Groups)
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
      .attr('r', d => (d.role === 'PRODUCER' ? 20 : d.role === 'CONSUMER' ? 20 : 16))
      .attr('fill', d =>
        d.role === 'PRODUCER' ? '#5C6E45' : d.role === 'CONSUMER' ? '#C79A5C' : '#A4502E'
      )
      .attr('stroke', '#F7F5F0')
      .attr('stroke-width', 2.5);

    // Node Labels
    node
      .append('text')
      .text(d => d.orgName || d.name)
      .attr('x', 26)
      .attr('y', 5)
      .attr('fill', '#241B14')
      .attr('font-family', 'monospace')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold');

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

      pulseProgress = (pulseProgress + 0.006) % 1;
      pulses
        .attr('cx', d => (d.source.x || 0) + ((d.target.x || 0) - (d.source.x || 0)) * pulseProgress)
        .attr('cy', d => (d.source.y || 0) + ((d.target.y || 0) - (d.source.y || 0)) * pulseProgress);
    });

    return () => simulation.stop();
  }, [members, flows, gaps]);

  return (
    <div ref={containerRef} className="relative w-full h-[550px] bg-mycelium/60 rounded-xl border border-loam/15 overflow-hidden shadow-inner">
      <svg ref={svgRef} className="w-full h-full" />

      {/* Selected Node Drawer */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-mycelium border border-loam/20 p-4 rounded-lg shadow-xl font-mono text-xs max-w-xs animate-in fade-in z-10">
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
