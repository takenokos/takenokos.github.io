import { useState } from "preact/hooks"
import { Icon } from '@iconify-icon/react';

const { signIn } = await import("auth-astro/client");

export default function Login() {
  const [error, setError] = useState("");
  const handleSocialLogin = async (provider: string) => {
    try {
      await signIn(provider);
    } catch (error: unknown) {
      setError(`Error signing in with ${provider}: ${(error as Error).message}`);
    }
  };

  return (
    <div
      class="w-full max-w-md p-8 mx-auto space-y-8 rounded-lg shadow-lg transition motion-opacity-in-0 motion-translate-y-in-50 motion-duration-600 motion-ease-spring-bouncier"
    >
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Continue with your social account
        </p>
      </div>

      {
        error && (
          <div class="p-4 text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-100 rounded-md text-center">
            {error}
          </div>
        )
      }

      <div class="mt-6 space-y-4">
        <button
          class="cursor-pointer w-full flex items-center justify-center py-2 px-4 rounded-md bg-slate-50 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 motion-scale-in-105 hover:motion-scale-out-105 motion-duration-300"
          onClick={() => handleSocialLogin('github')}
        >
          <Icon class="w-5 h-5 mr-3" icon="line-md:github-loop" />
          Sign in with GitHub
        </button>

        <button
          class="cursor-pointer w-full flex items-center justify-center py-2 px-4 rounded-md bg-slate-50 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 motion-scale-in-105 hover:motion-scale-out-105 motion-duration-300"
          onClick={() => handleSocialLogin('google')}
        >
          <Icon class="w-5 h-5 mr-3" icon="mdi:google" />
          Sign in with Google
        </button>
      </div>

      <p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
