# WingFi Insurance Chrome Extension

Chrome extension for buying flight insurance directly from booking confirmation pages.

## Features

- 🔍 **Auto-detect flight details** from booking pages (PNR + Flight Number)
- 💰 **Three pool options**: Global Pool, Airline Pool, Crowd-Fill Pool
- 🦊 **MetaMask integration** for secure transactions
- ⚡ **Instant coverage** with automated premium calculation
- 🎫 **Policy NFT** minted to your wallet

## Installation

### 1. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `wingFi-extension` folder
5. The WingFi extension icon should appear in your toolbar

### 2. Setup Requirements

- MetaMask browser extension installed
- Connected to BSC Testnet (Chain ID: 97)
- Some test BNB for gas fees
- Test USDC tokens for premiums

### 3. Test with Mock Booking Site

1. Open `mock-booking-site/index.html` in your browser
2. Fill in the test form with:
   - PNR (6 characters, e.g., ABC123)
   - Flight Number (e.g., EK524 for Emirates)
   - Passenger details
3. Click "Generate New Booking"
4. Click the WingFi extension icon
5. The extension should auto-fill the PNR and flight number!

## Usage

### For Users

1. **Book a flight** on any airline website
2. **Open the confirmation page** with your PNR
3. **Click the WingFi extension icon**
4. **Connect your wallet** (MetaMask)
5. Extension auto-detects:
   - PNR/Booking Reference
   - Flight Number
6. **Enter coverage amount** (default: $500)
7. **Click "Calculate Premium"** to see rates from all 3 pools
8. **Select your preferred pool**:
   - **Global Pool**: 5% premium, instant coverage, diversified risk
   - **Airline Pool**: 4% premium, airline-specific exposure
   - **Crowd-Fill**: 3.5% premium, best rate, needs funding (2-24 hrs)
9. **Review and confirm** purchase
10. **Approve USDC** spending (MetaMask popup)
11. **Confirm transaction** (MetaMask popup)
12. **Receive Policy NFT** in your wallet! 🎉

### Auto-Detection Works On

The extension tries to extract PNR and flight details from:
- Booking confirmation pages
- E-ticket pages
- Manage booking pages
- Email confirmation views (if opened in browser)

Supports major airlines:
- Emirates (EK)
- Air India (AI)
- Qatar Airways (QR)
- Delta (DL)
- Lufthansa (LH)
- Swiss (LX)
- Turkish Airlines (TK)
- IndiGo (6E)
- American Airlines (AA)
- British Airways (BA)

## Development

### File Structure

```
wingFi-extension/
├── manifest.json        # Extension configuration
├── popup.html          # Main UI
├── popup.js            # UI logic and Web3 interactions
├── styles.css          # Styling
├── content.js          # Page scraping for PNR extraction
├── background.js       # Service worker
├── config.js           # Contract addresses and ABIs
└── icons/              # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### How It Works

1. **Content Script** (`content.js`):
   - Runs on all pages
   - Extracts PNR and flight number using regex patterns
   - Stores detected data in Chrome storage

2. **Popup** (`popup.html` + `popup.js`):
   - Loads auto-detected flight details
   - Connects to MetaMask
   - Calculates premiums for all pool types
   - Handles USDC approval and policy purchase transactions

3. **Background Worker** (`background.js`):
   - Manages extension badge
   - Cleans up old cached data

### Contract Integration

The extension reads contract addresses from the deployment JSON:
```
http://localhost:3000/lib/deployment.json
```

In production, this should be:
- Bundled with the extension
- Or fetched from a CDN/IPFS

### Adding New Airlines

Edit `config.js` and add to `AIRLINES` object:

```javascript
AIRLINES: {
  'XX': { name: 'New Airline', code: 'XX' }
}
```

## Troubleshooting

### Extension Not Detecting Flight Details

- Make sure you're on a booking confirmation page
- PNR must be 6 alphanumeric characters
- Flight number must be in format: XX1234 (2 letters + 1-4 digits)
- Try manually entering if auto-detection fails

### MetaMask Errors

- Ensure you're on BSC Testnet (Chain ID: 97)
- Check you have test BNB for gas
- Check you have sufficient USDC balance

### Transaction Failing

- Check gas price is set correctly
- Ensure approval transaction completed
- Verify contract addresses are loaded in `config.js`

## Security Notes

- Extension only requests access to active tab
- Private keys never leave MetaMask
- All transactions require explicit user approval
- Contract interactions are transparent and auditable

## Future Enhancements

- [ ] Support for more airlines
- [ ] Integration with real airline APIs
- [ ] Automatic claim filing
- [ ] Policy management dashboard
- [ ] Multi-chain support
- [ ] Email parsing for forwarded confirmations

## License

MIT

