import type { Workflow } from '../types/workflow'

/**
 * Generate a mock n8n blueprint JSON.
 */
export function generateN8nBlueprint(workflow: Workflow): string {
    const nodes = workflow.nodes.map(n => {
        return {
            "parameters": {},
            "id": n.id,
            "name": n.data.label || "Node",
            "type": n.data.nodeType === 'start' ? "n8n-nodes-base.webhook" : "n8n-nodes-base.httpRequest",
            "typeVersion": 1,
            "position": [
                n.position.x,
                n.position.y
            ],
            "notes": n.data.description || ""
        }
    })

    const connections: Record<string, any> = {}
    workflow.nodes.forEach(n => {
        connections[n.data.label || "Node"] = { "main": [[]] }
    })

    // Very naive connection mapping
    workflow.edges.forEach(e => {
        const sourceNode = workflow.nodes.find(n => n.id === e.source)
        const targetNode = workflow.nodes.find(n => n.id === e.target)
        if (sourceNode && targetNode) {
            const sourceName = sourceNode.data.label || "Node"
            const targetName = targetNode.data.label || "Node"
            if (!connections[sourceName]) connections[sourceName] = { "main": [[]] }
            connections[sourceName]["main"][0].push({
                "node": targetName,
                "type": "main",
                "index": 0
            })
        }
    })

    const blueprint = {
        "name": workflow.name,
        "nodes": nodes,
        "connections": connections,
        "meta": {
            "templateCredsSetupCompleted": true
        }
    }

    return JSON.stringify(blueprint, null, 2)
}

/**
 * Generate a mock Make (Integromat) blueprint JSON.
 */
export function generateMakeBlueprint(workflow: Workflow): string {
    const modules = workflow.nodes.map((n, i) => {
        return {
            "id": i + 1,
            "module": "integromat:basic:sleep",
            "version": 1,
            "parameters": {},
            "mapper": {},
            "metadata": {
                "designer": {
                    "x": n.position.x,
                    "y": n.position.y
                },
                "name": n.data.label
            }
        }
    })

    const blueprint = {
        "name": workflow.name,
        "flow": modules,
        "metadata": {
            "version": 1
        }
    }

    return JSON.stringify(blueprint, null, 2)
}
