# Basicweb: Microsite experiments with Rust, Actix-Web, Diesel, Svelte and
SQLite.

This is a set of experiments with a variation of "microsites," small,
self-contained front-end and back-end "sites" that are intended to be
used alongside of one another in a larger project.

In general, I found that gluing the pieces together was not a terribly
efficient process.  However, I find that realworld sites can generally
be broken down into these sub-components:

- min: basic, minimal starting template; hello world.
- users: account, password reset, login, etc. 
- board: a board, with a hierarchy of posts and replies.
- catalog: an item catalog and transactions 
- events: events, with date, time and location
- galleries: a gallery structure
- locations: locations, using OpenStreetMap
- people: basic records for people and contacts (incomplete); not users.
- tags: tagging data structures
 
There are some examples of merging these sites into applications:
- app: A basic app skeleton, similar to `min`. 
- app-gallery: A gallery app, merges `app`, `users`, `galleries`, and `board`.
  Intended for photoblogs, etc. 
- app-biz (incomplete): merges `app`, `users`, `galleries`, `board`, `locations`,
  and `catalog`.  Intended for a general business or store, that may have
  a blog and some galleries.

None of these are considered complete; they are intended to be modified
in ways that will break modularity.

 
