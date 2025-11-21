---
title: "Nuclei: The Sniper of Vulnerability Scanners"
date: 2025-11-21
tags: ["CTF", "Writeup", "Automation"]
draft: false
toc: true
keywords: ["nuclei", "dast", "medium", "devsecops", "burpsuite", "xss"]
summary: "A beginner-friendly guide to using Nuclei, writing custom XSS fuzzing templates, and integrating it with Burp Suite."
---

<meta http-equiv="content-type" content="text/html; charset=utf-8"><img src="https://opengraph.githubassets.com/edd0bf0b7e3eb9c128b3ae96ac74cb891b89b99a735e49133692888d04062ee5/projectdiscovery/nuclei" jsaction="" class="sFlh5c FyHeAf iPVvYb" style="max-width: 1200px; height: 180px; margin: 4px 0px; width: 359px;" alt="GitHub - projectdiscovery/nuclei: Nuclei is a fast, customizable  vulnerability scanner powered by the global security community and built on  a simple YAML-based DSL, enabling collaboration to tackle trending  vulnerabilities on the internet." jsname="kn3ccd">

## What is Nuclei? 
Nuclei is a fast, open-source vulnerability scanner built by the folks at ProjectDiscovery. 

If you've used traditional scanners, you know they usually work like a "shotgun"—firing a massive, hard-coded database of checks at a target and hoping something hits. This often results in a lot of noise, slow scans, and false positives.

**Nuclei is different.** It acts more like a **"sniper."** It is entirely template-based, meaning it uses simple YAML files to describe exactly how to detect a specific vulnerability. This allows you to send precise requests to detect specific bugs (like a brand-new CVE) across thousands of hosts in minutes, without the mess of a generic scan.

**Why people love it:**
* **It's fast:** Built in Go, it handles parallel scanning effortlessly.
* **Community Powered:** The security community writes and updates templates constantly. Often, a template for a new CVE is available within hours of its disclosure.

## How can I use Nuclei? (Basic Usage)

Once you have Nuclei installed (usually via Go or a binary), you run it directly from the command line. Here are the essentials:

**1. Scan a Single Target**
This scans `example.com` using the default list of community templates.
```bash
nuclei -u https://example.com
```

2. Scan a List of Targets If you have a file urls.txt with many domains, Nuclei handles them in parallel.

```bash
nuclei -l urls.txt
```

3. Use Specific Templates To avoid scanning for everything, you can specify a template or a folder of templates (e.g., only looking for CVEs or misconfigurations).

```bash
nuclei -u https://example.com -t cves/ -t misconfiguration/
```

## Writing a Custom Template to Detect XSS
One of Nuclei's coolest features is its extensibility. You aren't limited to the default list of vulnerabilities provided by the community.

Nuclei allows you to write your own YAML templates, giving you the freedom to create custom test scenarios, reproduce specific bug bounty findings, or build regression tests for your own applications.

Let’s get our hands dirty and write a template that uses DAST capabilities to "fuzz" a URL and find Reflected XSS.


#### The Full Template

Here is the complete code for xss.yaml. Don't worry, we'll break it down below.

```
id: reflected-xss

info:
  name: Reflected XSS
  author: Enigma522
  severity: medium
  tags: xss,dast
  description: Find Ref XSS in query params
  reference: github


http:
  - payloads:
      xss:
        - "<img src=1 onerror=eval(atob('YWxlcnQoJ1hTUycp'))>"
        - "<script>alert(1)</script>"
        - "'\"><img src=x>" 
    
    fuzzing:
      - part: query
        mode: single
        fuzz: 
          - "{{xss}}"

    stop-at-first-match: true

    matchers-condition: and
    matchers:
      - type: word
        part: body
        words:
          - "{{xss}}"

      - type: word
        part: content_type
        words:
          - "text/html"
```

#### Let's Break It Down

1. **The Metadata** First, we need to give our template an identity.

```
id: reflected-xss

info:
  name: Reflected XSS
  author: Enigma522
  severity: medium
  tags: xss,dast
  description: Find Ref XSS in query params
  reference: github
```

2. **The Protocol & Payloads** Nuclei supports multiple protocols (DNS, FILE, TCP), but we are using http. Here, we define a list variable named xss that contains the malicious strings (payloads) we want to inject.

```
http:
  - payloads:
      xss:
        - "<img src=1 onerror=eval(atob('YWxlcnQoJ1hTUycp'))>"
        - "<script>alert(1)</script>"
        - "'\"><img src=x>" 
```


3. **The Fuzzing Engine** This is where the magic happens. We tell Nuclei to look at the query part of the URL (the stuff after ? like ?id=1).

* mode: single: Tells Nuclei to replace parameters one by one.
* fuzz: Tells it to replace the original value with our {{xss}} payloads defined above.

```
    fuzzing:
      - part: query
        mode: single
        fuzz: 
          - "{{xss}}"
```

4. **The Matchers** (Success Condition) Finally, how do we know if it worked? We use Matchers. To avoid false positives, we use matchers-condition: and. This means Nuclei will only report a vulnerability if BOTH of these things happen:

* The exact payload ({{xss}}) is reflected back in the response body.
* The response header content_type is text/html (because XSS won't trigger in a JSON or Plain Text file).

We also added `stop-at-first-match: true` so the scan stops immediately after finding one vulnerability, saving time.


```
    stop-at-first-match: true

    matchers-condition: and
    matchers:
      - type: word
        part: body
        words:
          - "{{xss}}"

      - type: word
        part: content_type
        words:
          - "text/html"
```


#### Running the Scan
To run this template, we will use the -dast flag. This flag is specifically designed to enable and run fuzzing capabilities within Nuclei.

![alt text](../../../images/articles/nuclei/image.png)

![alt text](../../../images/articles/nuclei/image1.png)


if the target is vulnerable, Nuclei will print the result in the terminal, showing exactly which payload triggered the XSS!

## Integrating with Burp Suite

If you live inside Burp Suite like most pentesters, you don't have to constantly switch to the terminal.

Here is how to set it up:

1. The Prerequisite: Jython Since this extension is written in Python, Burp needs an interpreter to run it.
* Download the Jython Standalone JAR file.
* In Burp, go to Extensions > Settings > Python Environment.
* Select the JAR file you just downloaded.

![alt text](../../../images/articles/nuclei/jython.png)


Install the Extension Head over to the Extensions tab (formerly BApp Store), search for "Nuclei Burp Integration," and hit install.

![alt text](../../../images/articles/nuclei/burp.png)

Now we can configure it to use our custom templates by setting the path of our custom templates

![alt text](../../../images/articles/nuclei/config.png)


Then we can simply use it from repeater

![alt text](../../../images/articles/nuclei/repeater.png)


![alt text](../../../images/articles/nuclei/xss.png)


Happy Hacking!