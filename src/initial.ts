import { Edge, Ranking } from './types';

type V = { [key: string]: boolean };

// Depth-First-Search (DFS) for an Directed Graph (cycles in paths are discarded)
function getPaths(
  nodeId: string,
  edges: Edge[],
  path: string[] = [],
  paths: string[][] = []
) {
  const children = edges.filter((e) => e.source === nodeId);

  // first check avoids cyclic paths
  if (path.includes(nodeId) || !children || children.length === 0)
    paths.push([...path, nodeId]);
  else children.map((c) => getPaths(c.target, edges, [...path, nodeId], paths));

  return paths.sort();
}

// A breadth-first-search algorithm to determine the ranking of the graph.
// The rank of a node is the earliest occurance it can have in the graph,
// with the root node(s) at rank 0.
function getInitialRanking(nodes: string[], edges: Edge[]) {
  return function (rank = 0, ranking: Ranking = [], visited: V = {}): Ranking {
    ranking[rank] = nodes;
    nodes.forEach((n) => (visited[n] = true));
    const ch = edges
      .filter((e) => !visited[e.target] && nodes.includes(e.source))
      .map((e) => e.target);

    if (ch && ch.length > 0)
      getInitialRanking([...new Set(ch)], edges)(rank + 1, ranking, visited);

    return ranking;
  };
}

// Order a ranking based on a sorted list of paths (determined using DFS)
// Nodes in the longer paths are placed earlier in their ranks
export default function initial(nodeId: string, edges: Edge[]): Ranking {
  const visited: V = {};
  const _paths = getPaths(nodeId, edges);

  const ranking: Ranking = [];
  const initialRanking = getInitialRanking([nodeId], edges)();

  _paths.forEach((p) => {
    initialRanking.forEach((rank: string[], index: number) => {
      const nodes = p.filter((n) => rank.includes(n) && !visited[n]);
      if (nodes && nodes.length > 0) {
        nodes.forEach((n) => (visited[n] = true));
        ranking[index] = [...(ranking[index] || []), ...nodes];
      }
    });
  });

  return ranking;
}
