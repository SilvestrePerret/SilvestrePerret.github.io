---
author: Silvestre Perret
title: SQL JOIN for Google Sheets™
slug: sqljoin-for-google-sheets
description: Adding a SQLJOIN custom function to Google Sheets™.
pubDatetime: 2025-12-07T15:33:05Z
featured: true
draft: false
ogImage: ../../assets/images/google-sheets-sqljoin-slide1.png
tags:
  - google-sheets
  - sql
---

![](../../assets/images/google-sheets-sqljoin-slide1.png)

Have you ever dreamed of using SQL JOINs directly within Google Sheets™? Well, I have.

![GIF](../../assets/images/google-sheets-sqjoin-gif1.gif)

As simple as `=SQLJOIN(B6:D10, F6:H8, 2, 1)` _(`2` and `1` are the columns to join on in the left and right tables resp.)_

Combine it with the [`QUERY`](https://support.google.com/docs/answer/3093343?hl=en) builtin function that provides SQL-like querying capabilities (``SELECT``, ``WHERE``, ``GROUP BY``, etc.) and you have the power of SQL where you need it.

![GIF](../../assets/images/google-sheets-sqjoin-gif2.gif)

`=QUERY(SQLJOIN(B2:D6,F2:H4,2,1), "SELECT Col4, MAX(Col3) GROUP BY Col4")`. Do you start to feel the power?

---
## How to use it?

Install the extension in your Google Sheets™ by going to `Extensions` -> `Add-ons` -> `Get add-ons`. Search for `SQLJOIN`, find the following logo,

![](../../assets/images/google-sheets-logo.png)

Click install then follow the instructions.

Then, just do:

```php
=SQLJOIN(B6:D10, F6:H8, 2, 1)
```

You point at the left table, the right table, and tell it which columns to join on. Adding or removing columns in either table doesn’t require updating the formula. Doing multiple joins is as simple as nesting `SQLJOIN` calls.

```php
=SQLJOIN(SQLJOIN(B6:D10, F6:H8, 2, 1), J6:L9, 3, 1)
```

You can join on multiple columns by providing arrays as the third and fourth arguments.

```php
=SQLJOIN(B6:D10, F6:H8, {2,3}, {1,2})
```

You can also specify the type of join (INNER, LEFT, RIGHT, FULL) as an optional fifth argument. Default is INNER.

```php
=SQLJOIN(B6:D10, F6:H8, 2, 1, "LEFT")
```

It also works on Google Sheets™ tables

```c
=SQLJOIN(Table1[#ALL], Table2[#ALL], 2, 1) // Don't forget the #ALL to include headers
```

---
## But why?

There is no way to achieve proper SQL-like JOINs in Google Sheets™ natively. This is such a weird state of affairs, I am still worried that I missed something obvious.

The contenters are:

- Using `VLOOKUP`, `HLOOKUP`, `XLOOKUP` (or even `INDEX`+`MATCH`) functions. You need a formula in every cell. Beware of what happens when rows are added or removed. 
- Using these `LOOKUP` functions in combination with `ARRAYFORMULA` can help a bit, but it is cumbersome, especially when you need to join multiple columns or multiple tables (at least to me).

---
## Known limitations

Custom functions have an overhead (due to serialization/deserialization and Apps Script™ execution time). Even for small tables, expect a few seconds of delay.
