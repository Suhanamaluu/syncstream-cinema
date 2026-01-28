import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateRoomCode, isValidRoomCode } from '@/lib/roomCode';
import { Users, Play, Tv2, ArrowRight } from 'lucide-react';

export const LandingHero = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    const roomCode = generateRoomCode();
    navigate(`/room/${roomCode}?role=host`);
  };

  const handleJoinRoom = () => {
    const code = joinCode.toUpperCase().trim();
    
    if (!code) {
      setError('Please enter a room code');
      return;
    }
    
    if (!isValidRoomCode(code)) {
      setError('Invalid room code format');
      return;
    }
    
    navigate(`/room/${code}?role=viewer`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(190_95%_50%_/_0.08)_0%,_transparent_70%)]" />
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Tv2 className="w-12 h-12 text-primary" />
          <h1 className="text-5xl sm:text-6xl font-display font-bold gradient-text">
            WatchTogether
          </h1>
        </div>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Stream your local videos in sync with friends. One hosts, everyone watches together in real-time.
        </p>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Create Room Card */}
          <div className="glass-hover p-8 rounded-2xl text-center group cursor-pointer" onClick={handleCreateRoom}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">Create Room</h2>
            <p className="text-muted-foreground mb-6">
              Host a watch party and share your video with friends
            </p>
            <Button variant="hero" size="lg" className="w-full group-hover:scale-[1.02] transition-transform">
              Start Hosting
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Join Room Card */}
          <div className="glass-hover p-8 rounded-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
              <Users className="w-8 h-8 text-foreground" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">Join Room</h2>
            <p className="text-muted-foreground mb-4">
              Enter a room code to join an existing watch party
            </p>
            <div className="space-y-3">
              <Input
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="text-center font-mono text-lg tracking-wider uppercase bg-surface border-border focus:border-primary"
                maxLength={6}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button 
                variant="glass" 
                size="lg" 
                className="w-full"
                onClick={handleJoinRoom}
              >
                Join as Viewer
              </Button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid sm:grid-cols-3 gap-8 text-center">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-primary font-display font-bold text-3xl mb-2">Real-time</div>
            <p className="text-muted-foreground text-sm">Synchronized playback for everyone</p>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-primary font-display font-bold text-3xl mb-2">WebRTC</div>
            <p className="text-muted-foreground text-sm">Peer-to-peer video streaming</p>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-primary font-display font-bold text-3xl mb-2">No Signup</div>
            <p className="text-muted-foreground text-sm">Just create a room and share</p>
          </div>
        </div>
      </div>
    </div>
  );
};
