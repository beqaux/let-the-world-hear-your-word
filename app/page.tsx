import { redis } from "@/lib/redis";

export const revalidate = 30;

async function getCurrentMessage(): Promise<string> {
  try {
    const message = await redis.get('current_message');
    return message?.toString() || 'No message has been set yet. Be the first to leave your mark!';
  } catch (error) {
    console.error('Error fetching message:', error);
    return 'Error loading message. Please try again later.';
  }
}

export default async function Home() {
  const currentMessage = await getCurrentMessage();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Let The World Hear Your Words!</h1>
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl mb-8">
            <p className="text-xl md:text-2xl font-light italic">
              &ldquo;{currentMessage}&rdquo;
            </p>
          </div>
          <form action="/api/create-checkout-session" method="POST">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Pay $1 to Change This Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
