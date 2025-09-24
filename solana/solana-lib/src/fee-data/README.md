# **Computing Fees and Priority Fees in Solana**

In Solana, **fees** and **priority fees** are influenced by network conditions, making them **not fully deterministic** but still **predictable to some extent**.

---

## **1. Computing Base Transaction Fees**

Solana uses a **fixed fee structure** based on transaction size. The base fee is computed as:

base_fee = num_signatures \* signature_fee

- **Signature Fee**: A fixed amount per signature (historically 5000 lamports per signature, but subject to change).
- **Num Signatures**: Typically 1 for standard transactions, more if using multi-signature accounts.

Thus, if network parameters remain unchanged, you can **deterministically** compute the **base fee**.

---

## **2. Computing Priority Fee (Not Deterministic)**

The **priority fee** is **market-driven**, meaning it depends on **current network congestion**. Users specify the **compute unit price** in lamports per **compute unit**. The total priority fee is then:

priority_fee = compute_units_used \* compute_unit_price

- **Compute Units Used**: Can be estimated based on the transaction complexity but varies based on program execution.
- **Compute Unit Price**: Set by the user, competes with others in a bidding system.

### **Why is Priority Fee Not Deterministic?**

- The **compute units used** may vary due to transaction execution conditions.
- The **compute unit price** is market-driven and changes based on network demand.

Thus, **you can estimate priority fees, but they are not deterministic**.

---

## **3. Can You Precompute Fees?**

| Fee Type         | Deterministic? | Notes                                            |
| ---------------- | -------------- | ------------------------------------------------ |
| **Base Fee**     | ✅ Yes         | Fixed per signature and transaction size.        |
| **Priority Fee** | ❌ No          | Market-driven and depends on network congestion. |
| **Total Fees**   | ⚠️ Estimated   | Can be predicted but not guaranteed.             |
