# Web3 Analyst MCP

A powerful Web3 research and analysis tool built on Cloudflare Workers MCP (Model Context Protocol), designed to help Claude analyze and gather up-to-date information about blockchain projects, cryptocurrencies, and the broader Web3 ecosystem.

## Features

- **Project Information**: Get comprehensive details about any Web3 project
- **Market Data**: Real-time price and market metrics for cryptocurrencies
- **News Aggregation**: Latest news from multiple sources about specific projects
- **On-Chain Analytics**: Track on-chain metrics like active addresses and transactions
- **GitHub Activity**: Monitor development activity on project repositories
- **Social Sentiment**: Analyze Twitter sentiment for crypto projects
- **Research Reports**: Generate detailed research reports on Web3 projects
- **Portfolio Analysis**: Track and analyze Web3 asset portfolios
- **Event Tracking**: Keep up with upcoming events in the Web3 space
- **Multi-Project Comparison**: Compare metrics across different Web3 projects

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

## Installation

1. **Create a new Cloudflare Worker project**:

```bash
npm create cloudflare@latest web3-analyst-mcp
cd web3-analyst-mcp
```

2. **Install dependencies**:

```bash
npm install workers-mcp
```

3. **Copy the source files**:
   - Copy the `index.ts` file to your `src` directory
   - Copy the `wrangler.toml` configuration to your project root

4. **Configure your API keys**:
   - Open `wrangler.toml` and add your API keys for external services:
     - CoinGecko API key
     - GitHub API key
     - Other necessary API keys

5. **Set up Cloudflare KV namespace**:

```bash
wrangler kv:namespace create "WEB3_CACHE"
```

Then update your `wrangler.toml` file with the generated KV namespace ID.

6. **Set up the MCP server**:

```bash
npx workers-mcp setup
```

This command will prepare your Cloudflare Worker for use with the MCP protocol.

7. **Deploy the worker**:

```bash
npm run deploy
```

8. **Install the Claude integration**:

```bash
npx workers-mcp install:claude
```

This will make the MCP server available to Claude.

## Using with Claude

Once your Web3 Analyst MCP is set up, Claude will have access to the following functions:

### Core Functions

| Function | Description |
|----------|-------------|
| `getProjectInfo(projectIdentifier)` | Get detailed information about a Web3 project |
| `getPriceData(symbol)` | Get current market data for a cryptocurrency |
| `getLatestNews(topic, limit)` | Fetch latest news about a project or topic |
| `getOnChainData(projectName)` | Get on-chain activity metrics |
| `scrapeProjectWebsite(websiteUrl)` | Extract content from a project's website |
| `getGitHubActivity(repoOwner, repoName)` | Get development metrics from GitHub |
| `generateResearchReport(projectName)` | Create a comprehensive research report |
| `analyzeSocialSentiment(projectName)` | Analyze Twitter sentiment |
| `compareProjects(projectNames[])` | Compare multiple projects across metrics |
| `searchWeb3Info(query, sources[])` | Search for information across data sources |
| `analyzePortfolio(assets[])` | Analyze a portfolio of Web3 assets |
| `getUpcomingEvents(category, limit)` | Get information about upcoming events |

### Example Usage Scenarios

1. **Research a specific cryptocurrency**:
   - "Tell me about Ethereum's current market status and recent developments"
   - Claude can use `getProjectInfo`, `getPriceData`, and `getLatestNews` to provide comprehensive information

2. **Compare blockchain platforms**:
   - "Compare Solana, Avalanche, and Polkadot in terms of performance and adoption"
   - Claude can use `compareProjects` to provide a detailed comparison

3. **Analyze investment opportunities**:
   - "Analyze this portfolio: 2 BTC, 20 ETH, 1000 SOL"
   - Claude can use `analyzePortfolio` to provide insights and recommendations

4. **Track development progress**:
   - "How active is development on the Uniswap protocol?"
   - Claude can use `getGitHubActivity` to provide metrics on development activity

5. **Monitor social sentiment**:
   - "What's the current sentiment around Cardano on social media?"
   - Claude can use `analyzeSocialSentiment` to gauge community attitudes

## Advanced Configuration

### Customizing API Endpoints

You can modify the API endpoints used in the MCP tool by editing the source code in `src/index.ts`. Look for the fetch calls to various APIs and update the URLs as needed.

### Adding New Data Sources

To add new data sources:
1. Create a new method in the `Web3AnalystMCP` class
2. Implement the API call or web scraping logic
3. Deploy the updated worker
4. Claude will automatically have access to the new functionality

### Caching Strategy

The MCP tool uses Cloudflare KV for caching API responses to:
- Reduce API usage and avoid rate limits
- Improve response times
- Provide fallback data when APIs are unavailable

You can adjust the caching TTL (Time-To-Live) values in the implementation to balance freshness with performance.

## Troubleshooting

### Common Issues

1. **API Rate Limits**: If you're seeing errors about rate limits, consider:
   - Upgrading to paid API plans
   - Implementing more aggressive caching
   - Adding delay between requests

2. **MCP Connection Issues**: If Claude can't connect to your MCP server:
   - Ensure your worker is deployed correctly
   - Check that you've run the `install:claude` command
   - Restart Claude and the MCP server

3. **Data Freshness Problems**: If data appears outdated:
   - Check your caching settings
   - Verify API endpoints are correct
   - Ensure your worker has sufficient CPU time allocation

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Uses the [MCP protocol](https://modelcontextprotocol.io/) for LLM integration
- Powered by various Web3 APIs and data sources

---

Happy researching with your new Web3 Analyst MCP tool! 🚀