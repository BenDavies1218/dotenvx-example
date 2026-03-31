// apps/website/src/components/HowItWorks.tsx

interface Step {
  number: string;
  title: string;
  description: React.ReactNode;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Plain .env files get leaked",
    description: (
      <>
        Plaintext secrets sit on every developer's laptop, in backups, and in
        editor history. Encrypting them at rest means a leaked file is useless
        without the key.
      </>
    ),
  },
  {
    number: "02",
    title: "Sharing secrets is a liability",
    description: (
      <>
        When a new engineer joins, how do you give them access to the{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          .env
        </code>{" "}
        file? Every handoff is a potential leak. Storing the decryption key in{" "}
        <strong>1Password</strong> means access is managed, logged, and
        revocable — the same way you handle every other credential.
      </>
    ),
  },
  {
    number: "03",
    title: "Local Filesystem is an attack surface",
    description: (
      <>
        A{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          .env
        </code>{" "}
        file on disk can be read by any process running as your user — malicious
        npm packages, rogue scripts, or anyone with brief physical access.{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          envlock
        </code>{" "}
        decrypts secrets in memory and injects them directly into your process.
        Nothing is ever written to disk, so there's nothing to steal.
      </>
    ),
  },
];

export function WhyItsGood(): React.JSX.Element {
  return (
    <section id="why-its-good" className="max-w-4xl mx-auto px-6 pb-10">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center pb-8">
        Why All the Hassle, Why not just use a regular .env file?
      </h2>
      <div className="flex flex-col justify-center items-start gap-10">
        {steps.map((step) => (
          <div key={step.number}>
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
