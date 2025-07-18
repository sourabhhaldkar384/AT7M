const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const users = {
  "123456789012": { name: "Meena", pin: "1234", balance: 10000, history: [], lastLogin: null },
  "987654321098": { name: "Rahul", pin: "5678", balance: 5000, history: [], lastLogin: null }
};

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer)));
}

function getDateTime() {
  return new Date().toLocaleString("en-IN");
}

async function atmApp() {
  let attempts = 0;
  let cardNumber, pin, user;

  while (attempts < 3) {
    cardNumber = await ask("Enter Card Number: ");
    pin = await ask("Enter PIN: ");
    if (users[cardNumber] && users[cardNumber].pin === pin) {
      user = users[cardNumber];
      break;
    } else {
      console.log("❌ Invalid card number or PIN.");
      attempts++;
    }
  }

  if (!user) {
    console.log("🚫 Too many incorrect attempts. Try again later.");
    rl.close();
    return;
  }

  const now = getDateTime();
  console.log(`\n👋 Welcome, ${user.name}!`);
  console.log(`💰 Balance: ₹${user.balance}`);
  if (user.lastLogin) {
    console.log(`🕒 Last Login: ${user.lastLogin}`);
  }
  user.lastLogin = now;

  while (true) {
    console.log(`
🔘 Choose an option:
1. Balance Check
2. Deposit
3. Withdraw
4. View Transaction History
5. Exit
6. Change PIN
7. Transfer Money`);
    
    const choice = await ask("➡️ Your choice: ");

    switch (choice) {
      case "1":
        console.log(`💰 Current Balance: ₹${user.balance}`);
        break;

      case "2":
        const depositAmount = parseFloat(await ask("Enter deposit amount: ₹"));
        if (!isNaN(depositAmount) && depositAmount > 0) {
          user.balance += depositAmount;
          user.history.push(`[${getDateTime()}] Deposited ₹${depositAmount}`);
          console.log(`✅ ₹${depositAmount} deposited. New balance: ₹${user.balance}`);
        } else {
          console.log("❌ Invalid deposit amount.");
        }
        break;

      case "3":
        const withdrawAmount = parseFloat(await ask("Enter withdraw amount: ₹"));
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
          console.log("❌ Invalid withdraw amount.");
        } else if (withdrawAmount <= user.balance) {
          user.balance -= withdrawAmount;
          user.history.push(`[${getDateTime()}] Withdrew ₹${withdrawAmount}`);
          console.log(`✅ ₹${withdrawAmount} withdrawn. New balance: ₹${user.balance}`);
        } else {
          console.log("🚫 Insufficient balance.");
        }
        break;

      case "4":
        if (user.history.length === 0) {
          console.log("📭 No transactions yet.");
        } else {
          console.log("\n📜 Transaction History:");
          user.history.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry}`);
          });
        }
        break;

      case "5":
        console.log("🙏 Thank you for using the ATM!");
        rl.close();
        return;

      case "6":
        const oldPin = await ask("Enter current PIN: ");
        if (oldPin === user.pin) {
          const newPin = await ask("Enter new 4-digit PIN: ");
          if (/^\d{4}$/.test(newPin)) {
            user.pin = newPin;
            console.log("✅ PIN changed successfully.");
          } else {
            console.log("❌ Invalid PIN format. Must be 4 digits.");
          }
        } else {
          console.log("❌ Incorrect current PIN.");
        }
        break;

      case "7":
        const targetCard = await ask("Enter recipient's card number: ");
        const amount = parseFloat(await ask("Enter amount to transfer: ₹"));
        if (users[targetCard] && targetCard !== cardNumber) {
          if (!isNaN(amount) && amount > 0 && amount <= user.balance) {
            user.balance -= amount;
            users[targetCard].balance += amount;
            const time = getDateTime();
            user.history.push(`[${time}] Transferred ₹${amount} to ${users[targetCard].name}`);
            users[targetCard].history.push(`[${time}] Received ₹${amount} from ${user.name}`);
            console.log(`✅ ₹${amount} transferred to ${users[targetCard].name}.`);
          } else {
            console.log("❌ Invalid amount or insufficient balance.");
          }
        } else {
          console.log("❌ Invalid or same card number.");
        }
        break;

      default:
        console.log("❌ Invalid option.");
    }
  }
}

atmApp();
