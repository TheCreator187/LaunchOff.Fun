const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/create_token', (req, res) => {
    const { name, symbol, supply, decimals } = req.body;

    // Create SPL token using Solana CLI
    exec(`spl-token create-token --decimals ${decimals}`, (err, stdout, stderr) => {
        if (err) {
            console.error('Error creating token:', stderr);
            return res.status(500).json({ error: 'Failed to create token' });
        }

        const tokenAddress = stdout.match(/Creating token (\w+)/)?.[1];
        if (!tokenAddress) {
            return res.status(500).json({ error: 'Could not parse token address' });
        }

        // Mint initial supply
        exec(`spl-token mint ${tokenAddress} ${supply}`, (err, stdout, stderr) => {
            if (err) {
                console.error('Error minting token:', stderr);
                return res.status(500).json({ error: 'Minting failed' });
            }

            res.json({
                name,
                symbol,
                tokenAddress,
                supply,
                initial_price: '0.0001' // Placeholder, adjust as needed
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});