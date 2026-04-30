const ALGO_INFO = {
    'Breadth-First Search': {
        shortName: 'BFS',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        origin: 'C. Y. Lee / E. F. Moore',
        year: '1959',
        strengths: [
            'Guarantees shortest path on unweighted graphs',
            'Simple and predictable level-by-level expansion',
        ],
        weaknesses: [
            'High memory usage — stores entire frontier',
            'Ignores edge weights entirely',
        ],
        useCases: ['Social network friend suggestions', 'Web crawlers', 'Network broadcast routing'],
        desc: 'Explores all neighbours level by level; guarantees the shortest path on unweighted graphs.',
    },

    'Depth-First Search': {
        shortName: 'DFS',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        origin: 'C. P. Trémaux (formal: Hopcroft & Tarjan)',
        year: '1882',
        strengths: [
            'Low memory — only tracks current path',
            'Naturally explores full reachable space',
        ],
        weaknesses: [
            'Does not guarantee shortest path',
            'Can get stuck in deep or infinite branches',
        ],
        useCases: ['Topological sorting', 'Cycle detection', 'Maze generation'],
        desc: 'Dives deep along each branch before backtracking; does not guarantee the shortest path.',
    },

    "Dijkstra's Algorithm": {
        shortName: 'Dijkstra',
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        origin: 'Edsger W. Dijkstra',
        year: '1956',
        strengths: [
            'Optimal for non-negative weighted graphs',
            'Widely implemented and well-understood',
        ],
        weaknesses: [
            'Cannot handle negative edge weights',
            'No heuristic — explores in all directions',
        ],
        useCases: ['GPS navigation', 'OSPF network routing', 'Shortest road map queries'],
        desc: 'Visits the lowest-cost node first; guarantees the shortest path on weighted graphs.',
    },

    'A* Search': {
        shortName: 'A*',
        timeComplexity: 'O(E)',
        spaceComplexity: 'O(V)',
        origin: 'Hart, Nilsson & Raphael',
        year: '1968',
        strengths: [
            'Optimal with an admissible heuristic',
            'Much faster than Dijkstra in practice',
        ],
        weaknesses: [
            'Memory-intensive — keeps full open/closed sets',
            'Performance is heuristic-dependent',
        ],
        useCases: ['Game AI pathfinding', 'Robotics motion planning', 'GPS route search'],
        desc: 'Guides its search with a heuristic estimate; guarantees an optimal path efficiently.',
    },

    'Greedy Best-First Search': {
        shortName: 'GBFS',
        timeComplexity: 'O(E log V)',
        spaceComplexity: 'O(V)',
        origin: 'Nils Nilsson et al.',
        year: '~1964',
        strengths: [
            'Very fast — always moves toward the goal',
            'Low overhead, simple to implement',
        ],
        weaknesses: [
            'Not optimal — can follow misleading paths',
            'Completeness not guaranteed in cyclic graphs',
        ],
        useCases: ['Real-time game AI', 'Quick approximate pathfinding', 'Puzzle pre-solving'],
        desc: 'Always moves toward the target using a heuristic; fast but not always optimal.',
    },

    'Bidirectional Search': {
        shortName: 'Bi-Search',
        timeComplexity: 'O(b^(d/2))',
        spaceComplexity: 'O(b^(d/2))',
        origin: 'Ira Pohl',
        year: '1969',
        strengths: [
            'Dramatically reduces nodes expanded vs. one-way BFS',
            'Effective on large unweighted graphs',
        ],
        weaknesses: [
            'Complex termination condition',
            'Tricky to guarantee optimality when frontiers meet',
        ],
        useCases: ['Large-scale network pathfinding', 'Social graph connection search', 'Unweighted map routing'],
        desc: 'Runs BFS from start and end simultaneously; the two frontiers meet in the middle.',
    },

    'Uniform Cost Search': {
        shortName: 'UCS',
        timeComplexity: 'O(E log V)',
        spaceComplexity: 'O(V)',
        origin: 'Edsger W. Dijkstra',
        year: '1957',
        strengths: [
            'Optimal on non-negative weighted graphs',
            'General-purpose — no goal heuristic needed',
        ],
        weaknesses: [
            'Slower than A* — no heuristic guidance',
            'Explores uniformly in all cost directions',
        ],
        useCases: ['AI planning systems', 'General cost minimization', 'State-space search'],
        desc: 'Expands the lowest-cost frontier first; equivalent to Dijkstra on weighted graphs.',
    },

    'Bellman-Ford': {
        shortName: 'Bellman-Ford',
        timeComplexity: 'O(V × E)',
        spaceComplexity: 'O(V)',
        origin: 'Richard Bellman & Lester Ford Jr.',
        year: '1955–1956',
        strengths: [
            'Handles negative edge weights',
            'Detects negative-weight cycles',
        ],
        weaknesses: [
            'Slow O(V·E) — unsuitable for large graphs',
            'Much slower than Dijkstra when weights are non-negative',
        ],
        useCases: ['RIP network routing protocol', 'Currency arbitrage detection', 'Distributed shortest-path systems'],
        desc: 'Relaxes all edges repeatedly; handles negative weights and detects negative cycles.',
    },

    'Floyd-Warshall': {
        shortName: 'Floyd-Warshall',
        timeComplexity: 'O(V³)',
        spaceComplexity: 'O(V²)',
        origin: 'Robert Floyd & Stephen Warshall',
        year: '1962',
        strengths: [
            'Solves all-pairs shortest paths in one pass',
            'Handles negative edge weights',
        ],
        weaknesses: [
            'O(V³) time — impractical for large graphs',
            'O(V²) space — heavy memory usage',
        ],
        useCases: ['Dense network topology analysis', 'Transitive closure computation', 'Pre-computing travel time matrices'],
        desc: 'Computes shortest paths between every pair of nodes; handles negative weights.',
    },

    'Beam Search': {
        shortName: 'Beam Search',
        timeComplexity: 'O(B × d × E)',
        spaceComplexity: 'O(B × V)',
        origin: 'Bruce Lowerre (Harpy speech system)',
        year: '1976',
        strengths: [
            'Memory-efficient — limits frontier to beam width B',
            'Fast on large search spaces',
        ],
        weaknesses: [
            'Not complete — may miss the optimal path',
            'Quality highly dependent on beam width choice',
        ],
        useCases: ['Natural language processing (decoding)', 'Speech recognition', 'Protein structure prediction'],
        desc: 'Keeps only the top-B candidates at each level; trades optimality for speed and memory.',
    },

    'Weighted A*': {
        shortName: 'Weighted A*',
        timeComplexity: 'O(E)',
        spaceComplexity: 'O(V)',
        origin: 'Ira Pohl',
        year: '1970',
        strengths: [
            'Significantly faster than A* in practice',
            'Provides a bounded suboptimality guarantee (ε-optimal)',
        ],
        weaknesses: [
            'Not strictly optimal — solution can be up to ε× optimal cost',
            'Requires careful tuning of the weight parameter',
        ],
        useCases: ['Real-time game AI', 'Robotics with time constraints', 'Fast near-optimal planning'],
        desc: 'Inflates the heuristic by ε for speed; finds a path within ε× the optimal cost.',
    },

    'IDA*': {
        shortName: 'IDA*',
        timeComplexity: 'O(b^d)',
        spaceComplexity: 'O(d)',
        origin: 'Richard Korf',
        year: '1985',
        strengths: [
            'Linear memory — only stores current path',
            'Optimal with an admissible heuristic',
        ],
        weaknesses: [
            'Revisits many nodes — slower than A* in time',
            'Poorly suited when heuristic values vary little',
        ],
        useCases: ['Sliding puzzles (15-puzzle)', 'Memory-constrained pathfinding', 'Chess endgame solvers'],
        desc: 'Iterative-deepening A* with linear memory; optimal with an admissible heuristic.',
    },

    'Bidirectional A*': {
        shortName: 'Bi-A*',
        timeComplexity: 'O(b^(d/2))',
        spaceComplexity: 'O(b^(d/2))',
        origin: 'Ira Pohl',
        year: '1971',
        strengths: [
            'Combines heuristic guidance with bidirectional speed',
            'Very efficient on large, well-structured graphs',
        ],
        weaknesses: [
            'Complex meeting condition — harder to implement correctly',
            'Heuristic must be consistent in both directions',
        ],
        useCases: ['Large-scale GPS navigation', 'Robotics long-range planning', 'Knowledge graph querying'],
        desc: 'Runs A* from both ends simultaneously; heuristic-guided and highly efficient.',
    },
};

export default ALGO_INFO;
