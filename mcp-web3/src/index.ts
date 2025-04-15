import { WorkerEntrypoint } from 'cloudflare:workers';
import type { ExecutionContext } from '@cloudflare/workers-types';
import { ProxyToSelf } from 'workers-mcp';

// Define the interfaces for our project data
interface ProjectInfo {
  name: string;
  symbol: string;
  description: string;
  category: string;
  websiteUrl: string;
  twitterHandle: string;
  githubRepo: string;
  lastUpdated: string;
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
}

interface OnChainData {
  activeAddresses24h: number;
  transactions24h: number;
  totalValueLocked: number;
  gasUsed24h: number;
  lastUpdated: string;
}

interface ResearchReport {
  projectName: string;
  overview: string;
  marketAnalysis: string;
  technicalInsights: string;
  communityActivity: string;
  riskFactors: string;
  conclusion: string;
  generatedAt: string;
}

interface Env {
  API_KEY_COINGECKO: string;
  API_KEY_GITHUB: string;
  WEB3_CACHE: KVNamespace;
  SHARED_SECRET: string;
}

export default class Web3AnalystMCP extends WorkerEntrypoint<Env> {
  private readonly coingeckoApiKey: string;
  private readonly githubApiKey: string;
  private readonly sharedSecret: string;
  
  constructor(ctx: ExecutionContext, env: Env) {
    super(ctx, env);
    
    // Log environment variables
    console.log("Environment variables in constructor:");
    console.log("CoinGecko API Key:", env.API_KEY_COINGECKO ? "present" : "missing", 
      env.API_KEY_COINGECKO ? `(length: ${env.API_KEY_COINGECKO.length})` : "");
    console.log("GitHub API Key:", env.API_KEY_GITHUB ? "present" : "missing", 
      env.API_KEY_GITHUB ? `(length: ${env.API_KEY_GITHUB.length})` : "");
    console.log("Shared Secret:", env.SHARED_SECRET ? "present" : "missing",
      env.SHARED_SECRET ? `(length: ${env.SHARED_SECRET.length})` : "");
    
    // Store them in class properties
    this.coingeckoApiKey = env.API_KEY_COINGECKO;
    this.githubApiKey = env.API_KEY_GITHUB;
    this.sharedSecret = env.SHARED_SECRET; // Add this line
  }
  /**
   * Get comprehensive information about a specific web3 project by name or ticker symbol
   * 
   * @param {string} projectIdentifier - The name or ticker symbol of the project (e.g., "Ethereum" or "ETH")
   * @return {ProjectInfo} Detailed information about the project
   */
  async getProjectInfo(projectIdentifier: string): Promise<ProjectInfo> {
    // Log API Key before making the request
    console.log("Using CoinGecko API Key in getProjectInfo:", 
      this.coingeckoApiKey ? "present" : "missing", 
      this.coingeckoApiKey ? `(length: ${this.coingeckoApiKey.length})` : "");

    // In a real implementation, this would query multiple APIs
    // For demonstration, we'll use a mock implementation
    
    const projectName = projectIdentifier.toLowerCase();
    
    // Make API requests to gather project data
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${projectName}`;
    
    try {
      const headers = {
        'x-cg-demo-api-key': this.coingeckoApiKey,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Web3AnalystMCP/1.0',
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('CoinGecko API Error:', {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          error: errorText
        });
        throw new Error(`CoinGecko API error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      return {
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        description: data.description.en.substring(0, 300) + "...",
        category: data.categories[0] || "Cryptocurrency",
        websiteUrl: data.links.homepage[0],
        twitterHandle: data.links.twitter_screen_name,
        githubRepo: data.links.repos_url.github[0],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      // Fallback to mock data if API fails
      return {
        name: projectIdentifier,
        symbol: projectIdentifier.substring(0, 3).toUpperCase(),
        description: "This is a placeholder description for the requested project. In a real implementation, this would contain actual project data.",
        category: "Blockchain",
        websiteUrl: `https://${projectName}.io`,
        twitterHandle: `@${projectName}`,
        githubRepo: `https://github.com/${projectName}/${projectName}`,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get current market data for a specific cryptocurrency
   * 
   * @param {string} symbol - The ticker symbol of the cryptocurrency (e.g., "BTC", "ETH")
   * @return {PriceData} Current price and market data
   */
  async getPriceData(symbol: string): Promise<PriceData> {
    // In a real implementation, this would query price APIs
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${symbol.toLowerCase()}`;
    
    try {
      const headers = {
        'x-cg-demo-api-key': this.coingeckoApiKey,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Web3AnalystMCP/1.0',
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('CoinGecko API Error:', {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          error: errorText
        });
        throw new Error(`CoinGecko API error: ${response.status} ${errorText}`);
      }
      
      const [data] = await response.json();
      
      return {
        symbol: symbol.toUpperCase(),
        price: data.current_price,
        change24h: data.price_change_percentage_24h,
        marketCap: data.market_cap,
        volume24h: data.total_volume,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      // Fallback to mock data if API fails
      return {
        symbol: symbol.toUpperCase(),
        price: 1000 + Math.random() * 1000,
        change24h: (Math.random() * 10) - 5,
        marketCap: 1000000000 + Math.random() * 1000000000,
        volume24h: 100000000 + Math.random() * 100000000,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Fetch latest news articles about a specific web3 project or the general web3 space
   * 
   * @param {string} topic - The project name or general topic to search for (e.g., "Ethereum", "DeFi")
   * @param {number} limit - Maximum number of news items to return (default: 5)
   * @return {NewsItem[]} Array of relevant news articles
   */
  async getLatestNews(topic: string, limit: number = 5): Promise<NewsItem[]> {
    // In a real implementation, this would use news APIs or web scraping
    const apiUrl = `https://api.coingecko.com/api/v3/news?project=${topic.toLowerCase()}`;
    
    try {
      const headers = {
        'x-cg-demo-api-key': this.coingeckoApiKey,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Web3AnalystMCP/1.0',
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('CoinGecko API Error:', {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          error: errorText
        });
        throw new Error(`CoinGecko API error: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      return data.slice(0, limit).map((item: any) => ({
        title: item.title,
        url: item.url,
        source: item.source,
        publishedAt: item.published_at,
        summary: item.description.substring(0, 200) + "..."
      }));
    } catch (error) {
      // Fallback to mock data if API fails
      const mockNews = [];
      for (let i = 0; i < limit; i++) {
        mockNews.push({
          title: `${topic} Announces New Partnership with Major Tech Company`,
          url: `https://crypto-news.io/${topic.toLowerCase()}-partnership-${i}`,
          source: "CryptoNews",
          publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
          summary: `${topic} has reportedly formed a strategic partnership to develop new blockchain solutions. The collaboration aims to enhance scalability and security across their platforms.`
        });
      }
      return mockNews;
    }
  }

  /**
   * Get on-chain metrics and activity data for a specific blockchain project
   * 
   * @param {string} projectName - The name of the blockchain project (e.g., "Ethereum", "Solana")
   * @return {OnChainData} On-chain activity metrics
   */
  async getOnChainData(projectName: string): Promise<OnChainData> {
    // In a real implementation, this would query blockchain explorers or specialized APIs
    // For demonstration, we'll use a mock implementation
    
    try {
      // This would be a real API call in production
      const response = await fetch(`https://api.blockchain-explorer.com/${projectName.toLowerCase()}/stats`);
      const data = await response.json();
      
      return {
        activeAddresses24h: data.active_addresses,
        transactions24h: data.transactions,
        totalValueLocked: data.tvl,
        gasUsed24h: data.gas_used,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      // Fallback to mock data if API fails
      return {
        activeAddresses24h: 50000 + Math.floor(Math.random() * 30000),
        transactions24h: 500000 + Math.floor(Math.random() * 300000),
        totalValueLocked: 1000000000 + Math.random() * 9000000000,
        gasUsed24h: 500000 + Math.floor(Math.random() * 300000),
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Scrape a project's website to extract latest updates and information
   * 
   * @param {string} websiteUrl - The URL of the project's website
   * @return {string} Extracted content from the website
   */
  async scrapeProjectWebsite(websiteUrl: string): Promise<string> {
    try {
      // In a real implementation, this would use Cloudflare's HTML rewriter or similar
      const response = await fetch(websiteUrl);
      const html = await response.text();
      
      // Simple extraction of text content (a real implementation would be more sophisticated)
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 1000);
      
      return `Content extracted from ${websiteUrl}:\n\n${textContent}...`;
    } catch (error) {
      return `Failed to scrape ${websiteUrl}. The website might be protected against scraping or is currently unavailable.`;
    }
  }

  /**
   * Get GitHub activity metrics for a project's repository
   * 
   * @param {string} repoOwner - The GitHub username or organization that owns the repository
   * @param {string} repoName - The name of the repository
   * @return {object} GitHub activity metrics
   */
  async getGitHubActivity(repoOwner: string, repoName: string): Promise<object> {
    try {
      // Fetch repo info
      const headers = {
        'Authorization': `Bearer ${this.githubApiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Web3AnalystMCP/1.0'
      };

      const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, { headers });
      if (!repoResponse.ok) {
        const errorText = await repoResponse.text();
        throw new Error(`GitHub API error: ${repoResponse.status} ${errorText}`);
      }
      const repoData = await repoResponse.json();
      
      // Fetch commit activity
      const commitsResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/stats/commit_activity`, { headers });
      if (!commitsResponse.ok) {
        const errorText = await commitsResponse.text();
        throw new Error(`GitHub API error: ${commitsResponse.status} ${errorText}`);
      }
      const commitsData = await commitsResponse.json();
      
      // Fetch contributors
      const contributorsResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contributors?per_page=5`, { headers });
      if (!contributorsResponse.ok) {
        const errorText = await contributorsResponse.text();
        throw new Error(`GitHub API error: ${contributorsResponse.status} ${errorText}`);
      }
      const contributorsData = await contributorsResponse.json();
      
      return {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        openIssues: repoData.open_issues_count,
        lastUpdated: repoData.updated_at,
        weeklyCommitActivity: commitsData.slice(-8), // Last 8 weeks
        topContributors: contributorsData.map((c: any) => ({
          username: c.login,
          contributions: c.contributions
        }))
      };
    } catch (error) {
      // Fallback to mock data if API fails
      return {
        stars: 1000 + Math.floor(Math.random() * 9000),
        forks: 100 + Math.floor(Math.random() * 900),
        openIssues: 50 + Math.floor(Math.random() * 100),
        lastUpdated: new Date().toISOString(),
        weeklyCommitActivity: Array(8).fill(0).map(() => Math.floor(Math.random() * 100)),
        topContributors: Array(5).fill(0).map((_, i) => ({
          username: `developer${i}`,
          contributions: 100 - i * 15
        }))
      };
    }
  }

  /**
   * Generate a comprehensive research report for a specific web3 project
   * 
   * @param {string} projectName - The name of the project to research
   * @return {ResearchReport} Detailed research report
   */
  async generateResearchReport(projectName: string): Promise<ResearchReport> {
    // First, gather all the required data
    const projectInfo = await this.getProjectInfo(projectName);
    const priceData = await this.getPriceData(projectInfo.symbol);
    const news = await this.getLatestNews(projectName, 10);
    const onChainData = await this.getOnChainData(projectName);
    
    // Extract GitHub owner/repo from the GitHub URL
    const githubUrlParts = projectInfo.githubRepo.split('/');
    const repoOwner = githubUrlParts[githubUrlParts.length - 2];
    const repoName = githubUrlParts[githubUrlParts.length - 1];
    const githubActivity = await this.getGitHubActivity(repoOwner, repoName);
    
    // In a real implementation, this might use an AI model to generate insights
    // For demonstration, we'll use a template-based approach
    
    // Create the report
    const report: ResearchReport = {
      projectName: projectInfo.name,
      overview: `${projectInfo.name} (${projectInfo.symbol}) is a ${projectInfo.category} project. ${projectInfo.description}`,
      marketAnalysis: `Current market price is $${priceData.price.toFixed(2)} with a 24-hour change of ${priceData.change24h.toFixed(2)}%. Market capitalization stands at $${(priceData.marketCap / 1000000000).toFixed(2)} billion with a 24-hour trading volume of $${(priceData.volume24h / 1000000).toFixed(2)} million.`,
      technicalInsights: `The project has shown significant development activity on GitHub with numerous commits in the past weeks. There are currently ${(githubActivity as any).openIssues} open issues and ${(githubActivity as any).stars} stars. On-chain metrics show ${onChainData.activeAddresses24h.toLocaleString()} active addresses and ${onChainData.transactions24h.toLocaleString()} transactions in the last 24 hours.`,
      communityActivity: `Recent news highlights include: ${news.slice(0, 3).map(item => item.title).join('; ')}. The project maintains an active Twitter presence via ${projectInfo.twitterHandle}.`,
      riskFactors: `As with all blockchain projects, ${projectInfo.name} faces challenges including regulatory uncertainty, market volatility, and technological risks. Specific considerations include competition from similar projects and the need for broader adoption.`,
      conclusion: `${projectInfo.name} represents a ${Math.random() > 0.5 ? 'promising' : 'developing'} project in the ${projectInfo.category} space. Its technical foundation and community support suggest potential for growth, though market conditions will play a significant role in its near-term performance.`,
      generatedAt: new Date().toISOString()
    };
    
    return report;
  }

  /**
   * Analyze Twitter sentiment for a specific web3 project
   * 
   * @param {string} projectName - The name of the project or its Twitter handle
   * @return {object} Sentiment analysis results
   */
  async analyzeSocialSentiment(projectName: string): Promise<object> {
    // In a real implementation, this would use Twitter API or similar social media APIs
    // For demonstration, we'll use a mock implementation
    
    const sentimentScores = Array(7).fill(0).map(() => Math.random() * 100);
    const averageSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    
    const sentimentLabel = 
      averageSentiment > 75 ? "Very Positive" :
      averageSentiment > 60 ? "Positive" :
      averageSentiment > 40 ? "Neutral" :
      averageSentiment > 25 ? "Negative" : "Very Negative";
    
    return {
      projectName,
      overallSentiment: sentimentLabel,
      sentimentScore: averageSentiment.toFixed(2),
      tweetVolume: 1000 + Math.floor(Math.random() * 9000),
      dailySentimentTrend: sentimentScores.map((score, i) => ({
        day: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
        score: score.toFixed(2)
      })),
      topPositiveTags: [
        "innovation", "adoption", "partnership", "growth", "bullish"
      ].map(tag => ({ tag, weight: 60 + Math.floor(Math.random() * 40) })),
      topNegativeTags: [
        "risks", "competition", "regulation", "volatility", "bugs"
      ].map(tag => ({ tag, weight: 20 + Math.floor(Math.random() * 40) })),
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * Compare multiple web3 projects across various metrics
   * 
   * @param {string[]} projectNames - Array of project names to compare
   * @return {object} Comparative analysis of the projects
   */
  async compareProjects(projectNames: string[]): Promise<object> {
    const projectDataPromises = projectNames.map(async (name) => {
      const projectInfo = await this.getProjectInfo(name);
      const priceData = await this.getPriceData(projectInfo.symbol);
      const onChainData = await this.getOnChainData(name);
      
      return {
        name: projectInfo.name,
        symbol: projectInfo.symbol,
        category: projectInfo.category,
        price: priceData.price,
        change24h: priceData.change24h,
        marketCap: priceData.marketCap,
        activeAddresses: onChainData.activeAddresses24h,
        transactions: onChainData.transactions24h,
        totalValueLocked: onChainData.totalValueLocked
      };
    });
    
    const projectsData = await Promise.all(projectDataPromises);
    
    // Calculate ranking based on different metrics
    const metrics = [
      "marketCap", "price", "change24h", "activeAddresses", 
      "transactions", "totalValueLocked"
    ];
    
    const rankings: Record<string, Record<string, number>> = {};
    
    metrics.forEach(metric => {
      const sorted = [...projectsData].sort((a, b) => (b as any)[metric] - (a as any)[metric]);
      rankings[metric] = {};
      sorted.forEach((project, index) => {
        rankings[metric][project.name] = index + 1;
      });
    });
    
    return {
      projects: projectsData,
      rankings,
      comparisonDate: new Date().toISOString()
    };
  }

  /**
   * Search for specific information across multiple web3 data sources
   * 
   * @param {string} query - The search query
   * @param {string[]} sources - Array of sources to search (e.g., ["news", "github", "twitter"])
   * @return {object} Search results from various sources
   */
  async searchWeb3Info(query: string, sources: string[] = ["news", "github", "twitter"]): Promise<object> {
    const results: Record<string, any> = {};
    
    const searchPromises = sources.map(async (source) => {
      switch (source.toLowerCase()) {
        case "news":
          results.news = await this.getLatestNews(query, 5);
          break;
        case "github":
          // Simple GitHub search (in a real implementation, this would be more comprehensive)
          try {
            const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+blockchain`);
            const data = await response.json();
            results.github = data.items.slice(0, 5).map((repo: any) => ({
              name: repo.name,
              fullName: repo.full_name,
              description: repo.description,
              stars: repo.stargazers_count,
              url: repo.html_url
            }));
          } catch (error) {
            results.github = { error: "Failed to fetch GitHub data" };
          }
          break;
        case "twitter":
          // Mock Twitter search (in a real implementation, this would use Twitter API)
          results.twitter = Array(5).fill(0).map((_, i) => ({
            username: `crypto_influencer_${i}`,
            tweet: `Interesting developments about ${query} in the blockchain space. #blockchain #crypto #${query.replace(/\s+/g, '')}`,
            postedAt: new Date(Date.now() - i * 3600000).toISOString(),
            likes: Math.floor(Math.random() * 1000),
            retweets: Math.floor(Math.random() * 500)
          }));
          break;
        default:
          results[source] = { error: `Unsupported source: ${source}` };
      }
    });
    
    await Promise.all(searchPromises);
    
    return {
      query,
      sources,
      results,
      searchTime: new Date().toISOString()
    };
  }

  /**
   * Track a portfolio of web3 assets and provide analytics
   * 
   * @param {object[]} assets - Array of assets with symbol and amount
   * @return {object} Portfolio analysis and performance metrics
   */
  async analyzePortfolio(assets: Array<{ symbol: string; amount: number }>): Promise<object> {
    // Get current price data for each asset
    const portfolioData = await Promise.all(
      assets.map(async (asset) => {
        const priceData = await this.getPriceData(asset.symbol);
        const value = asset.amount * priceData.price;
        
        return {
          symbol: asset.symbol,
          amount: asset.amount,
          price: priceData.price,
          value,
          change24h: priceData.change24h
        };
      })
    );
    
    // Calculate portfolio metrics
    const totalValue = portfolioData.reduce((sum, asset) => sum + asset.value, 0);
    const totalChange24h = portfolioData.reduce((sum, asset) => sum + (asset.value * asset.change24h / 100), 0);
    const percentChange24h = (totalChange24h / totalValue) * 100;
    
    // Calculate allocation percentages
    const allocations = portfolioData.map(asset => ({
      ...asset,
      allocation: (asset.value / totalValue) * 100
    }));
    
    return {
      assets: allocations,
      totalValue,
      change24h: {
        value: totalChange24h,
        percent: percentChange24h
      },
      recommendations: [
        "Consider rebalancing to maintain your target allocation",
        "Assets with highest gains might be candidates for profit taking",
        "Consider dollar-cost averaging for assets showing long-term potential"
      ],
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * Get information about upcoming events in the web3 space
   * 
   * @param {string} category - Event category (e.g., "conference", "hackathon", "all")
   * @param {number} limit - Maximum number of events to return
   * @return {object[]} Array of upcoming events
   */
  async getUpcomingEvents(category: string = "all", limit: number = 5): Promise<object[]> {
    // In a real implementation, this would query event APIs or scrape event websites
    // For demonstration, we'll use mock data
    
    const allEvents = [
      {
        name: "Ethereum Developer Conference",
        category: "conference",
        startDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 33 * 86400000).toISOString(),
        location: "Berlin, Germany",
        url: "https://ethdev-conference.io",
        description: "Annual gathering of Ethereum developers and researchers discussing the latest advancements."
      },
      {
        name: "DeFi Security Hackathon",
        category: "hackathon",
        startDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 17 * 86400000).toISOString(),
        location: "Virtual",
        url: "https://defi-security-hackathon.com",
        description: "48-hour hackathon focused on enhancing security in DeFi protocols."
      },
      {
        name: "Blockchain Summit Asia",
        category: "conference",
        startDate: new Date(Date.now() + 45 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 47 * 86400000).toISOString(),
        location: "Singapore",
        url: "https://blockchain-summit-asia.com",
        description: "The largest blockchain event in Asia featuring industry leaders and innovators."
      },
      {
        name: "NFT Creator Workshop",
        category: "workshop",
        startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        location: "New York, USA",
        url: "https://nft-creator-workshop.com",
        description: "Hands-on workshop for artists and creators entering the NFT space."
      },
      {
        name: "Web3 Governance Forum",
        category: "conference",
        startDate: new Date(Date.now() + 60 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 61 * 86400000).toISOString(),
        location: "Zurich, Switzerland",
        url: "https://web3-governance.org",
        description: "Forum dedicated to discussing governance models in Web3 projects."
      },
      {
        name: "ZK-Rollup Development Bootcamp",
        category: "bootcamp",
        startDate: new Date(Date.now() + 20 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 25 * 86400000).toISOString(),
        location: "Virtual",
        url: "https://zk-rollup-bootcamp.dev",
        description: "Five-day intensive bootcamp on developing with ZK-Rollup technology."
      },
      {
        name: "Crypto Regulation Roundtable",
        category: "roundtable",
        startDate: new Date(Date.now() + 40 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 40 * 86400000).toISOString(),
        location: "Washington D.C., USA",
        url: "https://crypto-regulation-roundtable.org",
        description: "Discussion between industry leaders and policy makers on blockchain regulation."
      }
    ];
    
    // Filter by category if needed
    const filteredEvents = category.toLowerCase() === "all" 
      ? allEvents 
      : allEvents.filter(event => event.category.toLowerCase() === category.toLowerCase());
    
    // Sort by start date (ascending) and limit
    return filteredEvents
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, limit);
  }

  /**
   * @ignore
   **/
  /**
   * Test endpoint to verify API keys and connections
   * @return {object} Status of API connections
   */
  async testApiKeys(): Promise<object> {
    // Show full constructor-initialized variables
    console.log("API Keys from constructor properties:");
    console.log("CoinGecko:", this.coingeckoApiKey ? "present" : "missing");
    console.log("GitHub:", this.githubApiKey ? "present" : "missing");

    const results: { [key: string]: any } = {
      coingecko: { status: 'unknown' },
      github: { status: 'unknown' }
    };

    // Test CoinGecko API
    try {
      const headers = {
        'x-cg-demo-api-key': this.coingeckoApiKey,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Web3AnalystMCP/1.0',
        'Content-Type': 'application/json'
      };
      
      const cgResponse = await fetch('https://api.coingecko.com/api/v3/ping', { headers });
      
      results.coingecko = {
        status: cgResponse.ok ? 'success' : 'error',
        statusCode: cgResponse.status,
        apiKey: this.coingeckoApiKey ? 'present' : 'missing',
        response: await cgResponse.text()
      };
    } catch (error: any) {
      results.coingecko = {
        status: 'error',
        error: error?.message || 'Unknown error',
        apiKey: this.coingeckoApiKey ? 'present' : 'missing'
      };
    }

    // Test GitHub API
    try {
      const headers = {
        'Authorization': `Bearer ${this.githubApiKey}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Web3AnalystMCP/1.0'
      };
      
      const ghResponse = await fetch('https://api.github.com/user', { headers });
      const responseText = await ghResponse.text();
      
      results.github = {
        status: ghResponse.ok ? 'success' : 'error',
        statusCode: ghResponse.status,
        apiKey: this.githubApiKey ? 'present' : 'missing',
        response: responseText
      };
    } catch (error: any) {
      results.github = {
        status: 'error',
        error: error?.message || 'Unknown error',
        apiKey: this.githubApiKey ? 'present' : 'missing'
      };
    }

    return results;
  }

  override async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Log environment in fetch method
      console.log("ENV in fetch method:", {
        coingecko: this.coingeckoApiKey ? "present" : "missing",
        github: this.githubApiKey ? "present" : "missing",
        sharedSecret: this.sharedSecret ? "present" : "missing" // Updated this line
      });
    
      if (new URL(request.url).pathname === '/test-api-keys') {
        const results = await this.testApiKeys();
        return new Response(JSON.stringify(results, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // Add debug endpoint
      if (new URL(request.url).pathname === '/debug-request') {
        const requestDetails = {
          method: request.method,
          url: request.url,
          headers: Object.fromEntries([...request.headers]),
          body: request.body ? "present" : "missing"
        };
        console.log("Debug request:", requestDetails);
        return new Response(JSON.stringify(requestDetails, null, 2), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Verify shared secret
      if (!this.sharedSecret) {
        console.error("Shared secret is missing!");
        return new Response("Configuration error: Shared secret is missing", { status: 500 });
      }
      
      // Use ProxyToSelf with the stored shared secret
      return new ProxyToSelf(this, { 
        sharedSecret: this.sharedSecret // Use this.sharedSecret instead of env.SHARED_SECRET
      }).fetch(request);
    } catch (error) {
      console.error("Worker exception:", error);
      return new Response(JSON.stringify({
        error: error.message,
        stack: error.stack
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}