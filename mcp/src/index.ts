import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { enrichPersonTool } from './tools/enrich.js'
import { verifyEmailTool, verifyPhoneTool } from './tools/verify.js'
import { osintCrawlTool, searchContactsTool } from './tools/osint.js'

const tools = [enrichPersonTool, verifyEmailTool, verifyPhoneTool, osintCrawlTool, searchContactsTool]

const server = new Server(
  { name: 'leadscale', version: '0.1.0' },
  { capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })),
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find((t) => t.name === request.params.name)
  if (!tool) {
    return { content: [{ type: 'text' as const, text: `Unknown tool: ${request.params.name}` }], isError: true }
  }

  try {
    const result = await tool.execute(request.params.arguments as never)
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { content: [{ type: 'text' as const, text: `Error: ${msg}` }], isError: true }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
console.error('LeadScale MCP server running')
