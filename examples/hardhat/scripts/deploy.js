import hre from 'hardhat'

async function main() {
  console.log('Deploying with envlock — PRIVATE_KEY and ALCHEMY_API_URL injected at runtime')
  const [deployer] = await hre.ethers.getSigners()
  console.log('Deploying from:', deployer.address)
  // deploy your contract here
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
