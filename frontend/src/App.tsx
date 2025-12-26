import { useState } from 'react'
import { Search, Star, GitFork, ExternalLink, Loader2 } from 'lucide-react'

// Types for our API response
interface Repository {
  name: string
  url: string
  stars: number
  description: string
  language: string
  topics: string[]
}

interface DiscoveryResponse {
  success: boolean
  username: string
  recommendations: Repository[]
  message: string
}

function App() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')

  const discoverRepos = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8000/api/discover?max_results=5')
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      
      const data: DiscoveryResponse = await response.json()
      setRepos(data.recommendations)
      setUsername(data.username)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            🐙 Octo
          </h1>
          <p className="text-xl text-purple-200">
            Your GitHub Contribution Companion
          </p>
          <p className="text-gray-400 mt-2">
            Discover repositories that match your skills and interests
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={discoverRepos}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 
                     disabled:bg-purple-800 text-white font-semibold py-3 px-8 
                     rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing your profile...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Discover Repositories
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            ❌ {error}
          </div>
        )}

        {/* User Info */}
        {username && (
          <div className="text-center mb-8">
            <p className="text-purple-300">
              Recommendations for <span className="font-bold text-white">@{username}</span>
            </p>
          </div>
        )}

        {/* Repository Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {repos.map((repo, index) => (
            <div
              key={repo.name}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6
                       hover:border-purple-500 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl font-bold text-purple-400">
                  #{index + 1}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{repo.stars.toLocaleString()}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 truncate">
                {repo.name}
              </h3>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {repo.description}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded">
                  {repo.language}
                </span>
              </div>

              {repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {repo.topics.slice(0, 3).map(topic => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 
                         text-sm font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Repository
              </a>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && repos.length === 0 && !error && (
          <div className="text-center text-gray-400 mt-12">
            <GitFork className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Click the button above to discover repositories!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
