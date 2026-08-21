

export default function Button({text}) {
  return <button className="bg-violet-600 hover:bg-green-500 rounded-lg px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">{text}</button>;
}