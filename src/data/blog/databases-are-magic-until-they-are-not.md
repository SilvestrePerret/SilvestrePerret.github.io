---
author: Silvestre Perret
title: 'Databases are magic ... until ...'
description: 'Databases are magic until they are not. OLTP vs OLAP explained.'
slug: databases-are-magic-until-they-are-not
pubDatetime: 2026-01-21T09:00:00Z
featured: false
draft: false
tags:
  - data
---

_**Disclaimers**: This post contains several simplifications to help explain the core database concepts. Specifically, it doesn't cover the distributed systems required to handle big data. **Only read footnotes if you want to dive deeper**🤿._


You have data. The best kind of data, the kind that fits nicely into tables: structured data. Your precious users gave it to you so you can provide them value. What should you do with it? How should you store it?

## The Great Librarian of Alexandria

![a pile of scrolls](../../assets/images/scrolls.jpg)
<div class="text-center width-full" style="margin-top:-1rem"><p><i>A pile of scrolls, courtesy of Nano Banana</i></p></div>

Third century BC, you are chosen to be the first Chief Librarian of the Great Library of Alexandria. You have scrolls upon scrolls of knowledge, and your task is to organize them so that visitors can find the information they need quickly.

You could organize the scrolls by topic, author, or date. How do you choose? How do you deal with new scrolls arriving every day?

Well, you do have a lot of experience with libraries and you know that people usually look for scrolls by author. So you decide to sort the scrolls alphabetically by author name. Then you put all the authors starting with 'A' on one shelf, 'B' in another shelf, and so on.

As you don't want to move scrolls around too much, you leave some empty space in each shelf to accommodate new scrolls. You also create a map at the entrance of the library that tells visitors which shelf to go to for each author.

It's great! It's working well. Visitors can find scrolls quickly, and new scrolls can be added easily (most of the time).

**But then**, one day, a new type of visitor arrives: **Statisticians**. They are asking weird questions: How many scrolls arrived last month? How many scrolls from authors whose names start with a 'C'? How many lines of text per scroll on average?

Your current organization is not optimized for these types of queries. You have to go through each shelf and count the scrolls manually. It takes a lot of time and effort.

## Databases are magic

Relational Databases ([PostgreSQL](https://www.postgresql.org/), [MySQL](https://www.mysql.com/), [SQLite](https://sqlite.org/), etc.) are like your library but on steroids. They use disk space instead of shelves. To keep things well-ordered, they will ask you to define `tables` and `columns`. For your scrolls, you could create a 'Scroll' table with the following columns: 'author', 'title', 'content' and 'creation_date'.

Then your database will take each scroll, pack it tightly into a succession of 0 and 1 which we call `record` (each record is a row of the 'Scroll' table) and store them on disk using `pages` which are very much like your shelves. As you did, it puts records one after the other on the page and leaves some empty space in each to accommodate new records. It also creates a kind of map (called an `index`) that tells on which page to find each record based on the value of a specific column (like your author-based shelf organization).[¹](#footnote-1)

If you want additional tables for even more organization (for example an 'Author' table), databases let you define relationships between your tables.

Finally, they provide you with a nice way to query that data: the **SQL (Structured Query Language)** language. You don't need to go through the 0 and 1 on the disk yourself, you just write SQL queries like `SELECT * FROM Scroll WHERE title = 'Odyssey'` and the database takes care of the rest.

These relational databases are optimized for a certain type of query: **simple queries that read or write a couple of individual records**. For example: finding a scroll by its title, adding a new author in the 'Author' table, updating the content of a given scroll. They are **FAST** for this kind of queries.

They can handle thousands of these queries per second, dozens of queries being processed simultaneously. These workloads are very common in web applications, e-commerce platforms, and other similar systems: for example, looking up a user by their ID, inserting a new order, updating a product's price, etc. In the software world, we call this kind of queries: **OLTP (Online Transaction Processing)** workloads.

<p id="footnote-1">¹ There are many other optimizations available in OLTP databases, e.g. we can have multiple indexes per table, indexes based on multiple columns, partial indexes, caches, etc.</p>

## Statisticians are kinda rude with databases

This new type of queries that statisticians want to run are different. These are complex queries that involve reading large amounts of data, performing calculations and aggregations. Answering "How many lines of text are there per scroll on average?" requires going through each 'Scroll' record, then counting the number of lines and aggregating these statistics over the whole table to get the final result. We call this kind of queries **OLAP (Online Analytical Processing)** workloads.

By default, traditional databases are not well-equipped to handle this kind of queries efficiently. You will need to use bigger and bigger servers for your database (which cost more and more money) and still have slower and slower queries as your data grows[²](#footnote-2).

**But** a different kind of systems called **Data Warehouses** ([DuckDB](https://duckdb.org/), [ClickHouse](https://clickhouse.com/), BigQuery, Snowflake) are optimized for this.

These systems store data in a different way: instead of storing records one after the other (**row-based storage**), they store data by columns (**columnar storage**). Imagine being able to store all the titles in one place, all the authors in another, and so on[³](#footnote-3). It's not practical if you want to get all the pieces of information regarding one scroll **but** if your goal is to count how many scrolls arrived last month, rather than having to go through all the records (i.e. read all the data), you now just need to read the content of the 'creation_date' column and ignore the rest. This allows data warehouses to reduce the amount of data that needs to be read from the disk and processed to answer a query.

Data Warehoures also try very hard to use as few 0 and 1 on the disk as possible to represent the data. For example, if 10 scrolls have the same author, let's say 'Homer' (5 characters), instead of writing on the disk the same name ten times, write only 'H' (1 character) ten times and create a map to keep track that 'H' represents 'Homer'. The full author's name is stored only once and then references are used. Instead of writing 50 characters, you used ~16 characters, that's a ~70% reduction. This is one (very simplified) example of **dictionary encoding**, one of the many **data compression** techniques these systems use.

Finally, data warehouses can make the assumption that a query will require processing a large quantity of data so they optimize everything accordingly: they **parallelize computations** on multiple CPU cores or even multiple machines, leveraging **data partitioning**. Partitioning means splitting large tables into smaller ones based on a column. For example, you could partition the 'Scroll' table by year of creation. So all scrolls created in -201 BC are in one partition, -199 BC in another, etc. When a query involves a specific year, only the relevant partition needs to be scanned, reducing the amount of data read and speeding up the query.

<p id="footnote-2">² Well, databases <b>are</b> magic, so even if they were not initially thought for it, there are still ways to transform them to handle OLAP queries better. Several Postgresql extensions manage to expand its capacities. Additionally, for specific use cases, it's possible to use some optimizations like materialized views, table partitioning, etc. to speed up OLAP queries on traditional databases.</p>

<p id="footnote-3">³ Data Warehouses systems generally also do have an equivalent of databases `pages`. Instead of storing records on a page, they store columns values one after the other. This is very handy if you only need a subset of the values of a column. See this cool <a href="https://sia.hackernoon.com/all-about-parquet-part-02-parquets-columnar-storage-model#h-how-parquet-organizes-data">article</a> for more details.</p>


![Library](../../assets/images/library.jpg)

<div class="text-center width-full" style="margin-top:-1rem"><p><i>Photo of the Rijksmuseum, Amsterdam by Will van Wingerden</i></p></div>

## What now?

When it comes to storing data, choosing the right tool for the job is mostly answering the question "what kind of queries will we process?". How many queries per second? How many records "touched" per query? What will be the proportion of read vs write queries?

Then you can choose a database, a data warehouse or use a more hybrid set up (metadata on the database + actual data on the data warehouse, or having data flowing from one to the other using ETL pipelines).

With great intel, great engineering is <span class="line-through">easy</span> easier! 😊

*The End*
