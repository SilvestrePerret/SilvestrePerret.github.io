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

Relational Databases (PostgreSQL, MySQL, SQLite, etc.) are like your library but on steroids. They use disk space instead of shelves. To keep things well ordered they ask you to define `tables` and `columns`. For your scrolls, you could create a 'Scroll' table with the following columns: 'author', 'title', 'content' and 'creation_date'.

Then they take each scroll, pack it tightly into a succession of 0 and 1 which we call `record` (each record is a row of the 'Scroll' table) and store them on disk using `pages` (like your shelves). Like you did, they put records one after the other on the page and leave some empty space in each to accommodate new records. They also create a kind of map (called an `index`) that tells them on which page to find each record based on the value of a specific column (like your author-based shelf organization).

> Note: There are many more optimizations happening under the hood (*multiple indexes per table, indexes based on multiple columns, query optimizer, caches, etc.*), but that's the gist of it.

If you want additional tables for even more organization (for example an 'Author' table), databases let you define relationships between your tables.

Finally they provide you with a nice way to query that data: the **SQL (Structured Query Language)** language. You don't need to go through the 0 and 1 on the disk, you just write SQL queries like `SELECT * FROM Scroll WHERE title = 'Odyssey'` and the database takes care of the rest.

They are **FAST** for the kind of queries they are optimized for: **simple queries that read or write a couple of individual records**. For example: finding a scroll by its title, adding a new author in the 'Author' table, updating the content of a given scroll. 

They can handle thousands of these queries per second. These workloads are very common in web applications, e-commerce platforms, and other similar systems: for example, looking up a user by their ID, inserting a new order, updating a product's price, etc. In the software world, we call these workloads **OLTP (Online Transaction Processing)** workloads.

## Statisticians are kinda rude with databases

This new type of queries that statisticians want to run are different. These are complex queries that involve aggregating large amounts of data, joining multiple sources, and performing calculations. We call these **OLAP (Online Analytical Processing)** workloads.

By default¹, relational databases are not well-equipped to handle this kind of queries efficiently. You will need to use bigger and bigger servers for your database (which cost more and more money) and still have slower and slower queries as your data grows.

**But** it exists a different kind of systems that are optimized for this: Data Warehouses (DuckDB, ClickHouse, BigQuery, Snowflake).

These systems store data in a different way: instead of storing records one after the other (row-based storage), they store data by columns (columnar storage). This allows them to read only the relevant columns for a query, reducing the amount of data that needs to be processed

They tries to use as few 0 and 1 on the disk as possible to represent the data. For example if 2 scrolls have the same author, they will store that the full author's name only once and then use references. This is called data compression.

Finally, they assume that a large quantity of data will be processed and they parallelize the work aggressively and perform operations on multiple data points simultaneously.

¹ TODO