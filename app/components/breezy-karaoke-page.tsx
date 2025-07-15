"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Mic, MicOff, Volume2, VolumeX, SkipBack, SkipForward, Search, Heart, Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Song {
  id: string
  title: string
  artist: string
  genre: string
  duration: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  lyrics: string[]
  audioUrl: string
  coverImage: string
  popularity: number
}

interface Recording {
  id: string
  songId: string
  title: string
  artist: string
  recordedAt: Date
  duration: number
  score: number
  audioUrl: string
}

export default function BreezyKaraokePage() {
  const [songs] = useState<Song[]>([
    {
      id: '1',
      title: 'Business Time',
      artist: 'Professional Singers',
      genre: 'Business',
      duration: 180,
      difficulty: 'Easy',
      lyrics: [
        'Making deals and closing sales',
        'Every call brings success',
        'Professional service every day',
        'Building relationships that last'
      ],
      audioUrl: '/demo-track.mp3',
      coverImage: '/placeholder.jpg',
      popularity: 95
    },
    {
      id: '2',
      title: 'Customer Service Song',
      artist: 'Support Team',
      genre: 'Service',
      duration: 210,
      difficulty: 'Medium',
      lyrics: [
        'Hello there, how can I help you today',
        'Your satisfaction is our priority',
        'We listen carefully to what you say',
        'Quality service in every way'
      ],
      audioUrl: '/demo-track-2.mp3',
      coverImage: '/placeholder.jpg',
      popularity: 88
    },
    {
      id: '3',
      title: 'Team Building Anthem',
      artist: 'Corporate Collective',
      genre: 'Motivational',
      duration: 195,
      difficulty: 'Hard',
      lyrics: [
        'Together we achieve more than alone',
        'Building dreams with every call',
        'Unity makes us strong and bold',
        'Success stories we tell them all'
      ],
      audioUrl: '/demo-track-3.mp3',
      coverImage: '/placeholder.jpg',
      popularity: 92
    }
  ])

  const [recordings] = useState<Recording[]>([
    {
      id: '1',
      songId: '1',
      title: 'Business Time',
      artist: 'Professional Singers',
      recordedAt: new Date('2024-01-15'),
      duration: 175,
      score: 92,
      audioUrl: '/recording-1.mp3'
    },
    {
      id: '2',
      songId: '2',
      title: 'Customer Service Song',
      artist: 'Support Team',
      recordedAt: new Date('2024-01-10'),
      duration: 205,
      score: 87,
      audioUrl: '/recording-2.mp3'
    }
  ])

  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [volume, setVolume] = useState([75])
  const [currentTime, setCurrentTime] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'all' || song.genre.toLowerCase() === selectedGenre.toLowerCase()
    return matchesSearch && matchesGenre
  })

  const genres = ['all', ...Array.from(new Set(songs.map(song => song.genre)))]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song)
    setCurrentTime(0)
    setCurrentLyricIndex(0)
    setIsPlaying(false)
  }

  const handleRecordToggle = () => {
    setIsRecording(!isRecording)
    // Recording logic would be implemented here
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    // Simulate lyrics progression
    if (isPlaying && currentSong) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          // Change lyrics every 45 seconds (demo)
          const newLyricIndex = Math.floor(newTime / 45)
          if (newLyricIndex !== currentLyricIndex && newLyricIndex < currentSong.lyrics.length) {
            setCurrentLyricIndex(newLyricIndex)
          }
          return newTime
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isPlaying, currentSong, currentLyricIndex])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Breezy Karaoke</h1>
        <p className="text-gray-600">Professional karaoke for team building and entertainment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Song Library */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Song Library</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                  <select 
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre}>
                        {genre === 'all' ? 'All Genres' : genre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                        currentSong?.id === song.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleSongSelect(song)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{song.title}</h3>
                          <p className="text-sm text-gray-600">{song.artist}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{song.genre}</Badge>
                            <Badge className={`text-xs ${getDifficultyColor(song.difficulty)}`}>
                              {song.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">{formatTime(song.duration)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{song.popularity}%</div>
                            <div className="text-xs text-gray-500">Popular</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSongSelect(song)
                              handlePlayPause()
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Player & Lyrics */}
        <div className="space-y-6">
          {/* Current Song Player */}
          <Card>
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSong ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <img
                      src={currentSong.coverImage}
                      alt={currentSong.title}
                      className="w-32 h-32 mx-auto rounded-lg object-cover mb-3"
                    />
                    <h3 className="font-semibold text-lg">{currentSong.title}</h3>
                    <p className="text-gray-600">{currentSong.artist}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(currentSong.duration)}</span>
                    </div>
                    <Slider
                      value={[currentTime]}
                      max={currentSong.duration}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button onClick={handlePlayPause} size="icon">
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <VolumeX className="h-4 w-4" />
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Volume2 className="h-4 w-4" />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      onClick={handleRecordToggle}
                      className="flex-1"
                    >
                      {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a song to start karaoke</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lyrics Display */}
          {currentSong && (
            <Card>
              <CardHeader>
                <CardTitle>Lyrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentSong.lyrics.map((line, index) => (
                    <p
                      key={index}
                      className={`text-center py-2 rounded ${
                        index === currentLyricIndex 
                          ? 'bg-blue-100 text-blue-800 font-semibold text-lg' 
                          : index < currentLyricIndex 
                            ? 'text-gray-400' 
                            : 'text-gray-700'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recordings History */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>My Recordings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recordings.map((recording) => (
                <div key={recording.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{recording.title}</h3>
                      <p className="text-sm text-gray-600">{recording.artist}</p>
                    </div>
                    <div className={`text-sm font-bold ${getScoreColor(recording.score)}`}>
                      {recording.score}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{formatTime(recording.duration)}</span>
                    <span>{recording.recordedAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden audio element for demo */}
      <audio ref={audioRef} />
    </div>
  )
} 