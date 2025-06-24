/*
WTFisSong: A Next.js app using Spotify API (Client Credentials) to show track info.
Glassmorphism UI with Parallax on hover, Roboto font.
Environment variables: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
*/

// package.json
{
"name": "wtfisong",
"version": "1.0.0",
"scripts": {
"dev": "next dev",
"build": "next build",
"start": "next start"
},
"dependencies": {
"next": "latest",
"react": "latest",
"react-dom": "latest",
"axios": "latest",
"sass": "latest"
}
}

// next.config.js
module.exports = {
reactStrictMode: true,
env: {
SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
}
};

// pages/_app.js
import '../styles/globals.scss';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
return <>


WTFisSong

<Component {...pageProps} />
</>;
}

// pages/index.js
import { useState } from 'react';
import GlassCard from '../components/GlassCard';
import axios from 'axios';

export default function Home() {
const [url, setUrl] = useState('');
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const fetchInfo = async () => {
setLoading(true);
setError('');
try {
const res = await axios.post('/api/track', { url });
setData(res.data);
} catch (e) {
setError('Failed to fetch. Make sure it is a valid Spotify track URL.');
}
setLoading(false);
};

return (

WTFisSong
<input
type="text"
placeholder="Paste Spotify track URL"
value={url}
onChange={e => setUrl(e.target.value)} />
Go
{error && {error}}
{data && }

);
}

// pages/api/track.js
import axios from 'axios';

async function getAccessToken() {
const resp = await axios.post('https://accounts.spotify.com/api/token',
'grant_type=client_credentials', {
headers: {
'Content-Type': 'application/x-www-form-urlencoded',
'Authorization': 'Basic ' + Buffer.from(
process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
).toString('base64')
}
});
return resp.data.access_token;
}

export default async function handler(req, res) {
const { url } = req.body;
const match = url.match(/track/([A-Za-z0-9]+)/);
if (!match) return res.status(400).json({ error: 'Invalid URL' });
const id = match[1];
try {
const token = await getAccessToken();
// Fetch track metadata
const track = await axios.get(https://api.spotify.com/v1/tracks/${id}, {
headers: { Authorization: Bearer ${token} }
}).then(r => r.data);
// BPM (audio features)
const features = await axios.get(https://api.spotify.com/v1/audio-features/${id}, {
headers: { Authorization: Bearer ${token} }
}).then(r => r.data);
// Album tracks ranking
const albumTracks = await axios.get(https://api.spotify.com/v1/albums/${track.album.id}/tracks?limit=50, {
headers: { Authorization: Bearer ${token} }
}).then(r => r.data.items);
const sortedAlbum = [...albumTracks].sort((a,b)=>b.popularity - a.popularity);
const albumRank = sortedAlbum.findIndex(t=>t.id===id) + 1;
// Artist discography (top 50 tracks)
const artistTop = await axios.get(https://api.spotify.com/v1/artists/${track.artists[0].id}/top-tracks?market=US, {
headers: { Authorization: Bearer ${token} }
}).then(r => r.data.tracks);
const sortedArtist = [...artistTop].sort((a,b)=>b.popularity - a.popularity);
const artistRank = sortedArtist.findIndex(t=>t.id===id) + 1;
// Genre/category: use first genre of artist
const artistInfo = await axios.get(https://api.spotify.com/v1/artists/${track.artists[0].id}, {
headers: { Authorization: Bearer ${token} }
}).then(r => r.data);
const genre = artistInfo.genres[0] || 'Info not available';
// Credits: Spotify doesn't provide writers/producers via public API
const credits = {
writers: 'Info not available',
producers: 'Info not available',
composers: 'Info not available'
};
// Assemble
res.status(200).json({
name: track.name,
popularity: track.popularity,
bpm: features.tempo,
album: {
name: track.album.name,
url: track.album.external_urls.spotify,
rank: albumRank,
total: albumTracks.length
},
artist: {
name: track.artists[0].name,
url: track.artists[0].external_urls.spotify,
rank: artistRank,
total: artistTop.length,
},
genre,
credits,
external_url: track.external_urls.spotify
});
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Server error' });
}
}

// components/GlassCard.js
import { useState } from 'react';

export default function GlassCard({ info }) {
const [offset, setOffset] = useState({ x:0, y:0 });
const handleMouse = e => {
const rect = e.currentTarget.getBoundingClientRect();
const x = (e.clientX - rect.left - rect.width/2)/20;
const y = (e.clientY - rect.top - rect.height/2)/20;
setOffset({ x, y });
};
return (
<div className="glass-card" onMouseMove={handleMouse}
style={{ transform: translate(${offset.x}px, ${offset.y}px) }}>
{info.name}
Popularity: {info.popularity}
Genre: {info.genre}
BPM: {info.bpm.toFixed(1)}

Album: {info.album.name}
Rank in album: {info.album.rank}/{info.album.total}


Artist: {info.artist.name}
Rank in artist top tracks: {info.artist.rank}/{info.artist.total}


Credits
Writers: {info.credits.writers}
Producers: {info.credits.producers}
Composers: {info.credits.composers}


);
}

// styles/globals.scss
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
body, input, button { font-family: 'Roboto', sans-serif; }
.container { display:flex; flex-direction:column; align-items:center; padding:2rem; background: #f0f0f0; min-height:100vh; }
input { padding:0.5rem; width:300px; margin:0.5rem; border-radius:8px; border:1px solid #ccc; }
button { padding:0.5rem 1rem; border:none; border-radius:8px; cursor:pointer; backdrop-filter: blur(5px); background: rgba(255,255,255,0.6); }
.error { color:red; }

// styles/GlassCard.scss
.glass-card {
position:relative;
backdrop-filter: blur(10px);
background: rgba(255,255,255,0.2);
border-radius:20px;
box-shadow: 0 4px 30px rgba(0,0,0,0.1);
padding:2rem;
margin-top:2rem;
max-width:400px;
transition: transform 0.1s ease-out;
}
.section { margin-top:1rem; }

