'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(identifier, password);
      
      // Get user data from localStorage to determine redirect
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const redirectUrl = user.role === 'admin' ? '/admin' : '/student';
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{
      backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' width='1920' height='1080' preserveAspectRatio='none' viewBox='0 0 1920 1080'%3e%3cg mask='url(%26quot%3b%23SvgjsMask1022%26quot%3b)' fill='none'%3e%3crect width='1920' height='1080' x='0' y='0' fill='rgba(18%2c 59%2c 113%2c 1)'%3e%3c/rect%3e%3cpath d='M15.94 761.44 a305.03 305.03 0 1 0 610.06 0 a305.03 305.03 0 1 0 -610.06 0z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M784.01 452.57 a290.75 290.75 0 1 0 581.5 0 a290.75 290.75 0 1 0 -581.5 0z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float3'%3e%3c/path%3e%3cpath d='M1621.97 748 a278.49 278.49 0 1 0 556.98 0 a278.49 278.49 0 1 0 -556.98 0z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M378.05976871662244 171.15370397547795L462.41845794918225 291.6303978543357 600.954154151189 104.85401706606703z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M1643.1956586955964 289.23644633498645L1787.65696086794 561.5544106435973 1934.4210788985251 335.5574873431509z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M111.4052618182292 913.5453137563028L285.60599468537305 1113.9403333614116 486.00101429048175 939.7396004942677 311.800281423338 739.3445808891589z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M683.35 587.62 a252.41 252.41 0 1 0 504.82 0 a252.41 252.41 0 1 0 -504.82 0z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float2'%3e%3c/path%3e%3cpath d='M1301.058648980143 32.56718813736546L1301.058648980143 254.7056757849815 1523.1971366277592 32.567188137365406z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M1168.62 509.74 a246.52 246.52 0 1 0 493.04 0 a246.52 246.52 0 1 0 -493.04 0z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float1'%3e%3c/path%3e%3cpath d='M897.648160569644 787.6563855888752L962.6634133378517 1048.4183217806158 1223.4253495295923 983.4030690124082 1158.4100967613847 722.6411328206675z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float3'%3e%3c/path%3e%3cpath d='M1128.69 166.48 a302.77 302.77 0 1 0 605.54 0 a302.77 302.77 0 1 0 -605.54 0z' fill='rgba(53%2c 110%2c 172%2c 0.4)' class='triangle-float3'%3e%3c/path%3e%3c/g%3e%3cdefs%3e%3cmask id='SvgjsMask1022'%3e%3crect width='1920' height='1080' fill='white'%3e%3c/rect%3e%3c/mask%3e%3cstyle%3e %40keyframes float1 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(-10px%2c 0)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float1 %7b animation: float1 5s infinite%3b %7d %40keyframes float2 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(-5px%2c -5px)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float2 %7b animation: float2 4s infinite%3b %7d %40keyframes float3 %7b 0%25%7btransform: translate(0%2c 0)%7d 50%25%7btransform: translate(0%2c -10px)%7d 100%25%7btransform: translate(0%2c 0)%7d %7d .triangle-float3 %7b animation: float3 6s infinite%3b %7d %3c/style%3e%3c/defs%3e%3c/svg%3e\")",
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-white px-8 py-6">
          <div className="flex justify-center mb-4">
            <Logo className="h-28 w-auto" withBorder={false} />
          </div>
          <div className="flex justify-center mb-2">
            <h1 className="text-2xl font-bold text-[#123b71] tracking-tight">
              Welcome Back
            </h1>
          </div>
          <div className="flex justify-center">
            <p className="text-gray-700 text-sm">Sign in to the SAT Mock Exam Platform</p>
          </div>
        </div>
        <div className="p-8 sm:p-10">

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 border focus:bg-white focus:border-[#123b71] focus:ring-[#123b71] sm:text-sm p-3 transition-colors text-black"
                  placeholder="Enter your username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 border focus:bg-white focus:border-[#123b71] focus:ring-[#123b71] sm:text-sm p-3 pr-10 transition-colors text-black"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#123b71] hover:bg-[#0d2a4d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#123b71] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
