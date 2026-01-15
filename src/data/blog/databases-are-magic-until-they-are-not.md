---
author: Silvestre Perret
title: 'Databases are magic until they are not'
description: 'Databases are magic until they are not. OLTP vs OLAP explained.'
slug: databases-are-magic-until-they-are-not
pubDatetime: 2026-01-21T15:00:00Z
featured: false
draft: true
tags:
  - data
---

You have data. The best kind of data, the kind that fits nicely into tables: structured data. Your precious users gave it to you so you can provide them value. What should you do with it? How should you store it?

## The Great Librarian of Alexandria

Third century BC, you are chosen to be the first Chief Librarian of the Great Library of Alexandria. You have scrolls upon scrolls of knowledge, and your task is to organize them so that visitors can find the information they need quickly.

You could organize the scrolls by topic, author, or date. How do you choose ? How do you deal with new scrolls arriving every day?

Well, you do have a lot of experience with libraries and you know that people usually look for scrolls by author. So you decide to sort the scrolls alphabetically by author name. Then you put all the authors starting with 'A' in one shelf, 'B' in another shelf, and so on. 

As you don't want to move scrolls around too much, you leave some empty space in each shelf to accommodate new scrolls. You also create a map at the entrance of the library that tells visitors which shelf to go to for each author.

It's great! It's working well. Visitors can find scrolls quickly, and new scrolls can be added easily (most of the time).

**But then**, one day, a new type of visitor arrives: Statisticians. They are asking weird questions: How many scrolls arrived last month? How many scrolls from authors whose names start with a 'C' ? How many lines of text per scroll on average?

Your current organization is not optimized for these types of queries. You have to go through each shelf and count the scrolls manually. It takes a lot of time and effort.

## Databases are magic

Relational Databases (PostgreSQL, MySQL, SQLite, etc.) are like your library but on steroids. They store your data in tables with columns and rows, let you define relationships between your tables and provide you with a way to query that data. 

They use **indexes** (like your shelf organization) to speed up data retrieval. They often keep mutliple indexes per table to allow different access patterns. In fact, they also use many other tricks to be as fast as possible for the kind of queries they are optimized for.

And they are optimized for what we call **OLTP (Online Transaction Processing)** workloads. These are workloads where you have a lot of small, simple queries that read or write **individual records** (or small numbers of records). For example, looking up a user by their ID, inserting a new order, updating a product's price, etc. These workloads are very common in web applications, e-commerce platforms, and other similar systems.

## Statisticians are a pain in the a**

This new type of queries that statisticians want to run are called **OLAP (Online Analytical Processing)** queries. These are complex queries that often involve aggregating large amounts of data, joining multiple sources, and performing calculations.

By default¹, relational databases are not well-equipped to handle this kind of queries efficiently. You will need bigger and bigger instances (which cost more and more money) and still have slower and slower queries as your data grows.

OLAP workloads require a different way of storing and querying your data:

¹ TODO