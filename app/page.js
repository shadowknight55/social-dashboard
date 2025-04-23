import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/Astrobear.png"
              alt="Astrobear Logo"
              width={60}
              height={60}
              className="rounded-full bg-black/20 p-1 hover:scale-105 transition-transform"
            />
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-yellow-500">
              Astrobear Social Dashboard
            </h1>
          </div>
          <nav className="flex gap-6">
            <a href="#" className="hover:text-yellow-400 transition-colors">Home</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Profile</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Messages</a>
          </nav>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4">Space Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Posts</span>
                <span className="text-yellow-400">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Followers</span>
                <span className="text-yellow-400">1.2K</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Following</span>
                <span className="text-yellow-400">890</span>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="md:col-span-2 space-y-6">
            {/* Post Creation */}
            <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
              <textarea
                placeholder="What's happening in your galaxy?"
                className="w-full bg-transparent border border-purple-500 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                rows="3"
              />
              <div className="flex justify-end mt-4">
                <button className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity">
                  Post
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
