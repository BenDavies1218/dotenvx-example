// apps/website/src/components/HowItWorks.tsx

interface Step {
  number: string;
  title: string;
  description: React.ReactNode;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Encrypt",
    description: (
      <>
        Run{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          dotenvx encrypt
        </code>{" "}
        to encrypt your{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          .env
        </code>{" "}
        files. Commit the encrypted files safely — no plaintext secrets in your
        repo.
      </>
    ),
  },
  {
    number: "02",
    title: "Store",
    description: (
      <>
        The decryption key lives in <strong>1Password</strong>, not on disk.
        Every engineer pulls the same encrypted files — no{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          .env.keys
        </code>{" "}
        file to share or lose.
      </>
    ),
  },
  {
    number: "03",
    title: "Inject",
    description: (
      <>
        Prefix any command with{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          envlock
        </code>
        . Secrets are decrypted in memory and injected into your process —
        nothing written to disk.
      </>
    ),
  },
];

export function HowItWorks(): React.JSX.Element {
  return (
    <section
      id="how-it-works"
      className="max-w-4xl mx-auto px-6 py-20 border-y border-gray-900"
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-12 text-center">
        How it works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {steps.map((step) => (
          <div key={step.number}>
            <span className="text-4xl font-bold text-gray-900 block mb-3 select-none">
              {step.number}
            </span>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
