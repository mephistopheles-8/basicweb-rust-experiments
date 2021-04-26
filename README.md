# Basicweb: Microsite experiments with Rust, Actix-Web, Diesel, Svelte and SQLite.

*Note: this is not currently under active development.*

This is a set of experiments with a variation of "microsites," small,
self-contained front-end and back-end "sites" that are intended to be
used alongside of one another in a larger project.

The idea was that most realworld sites can generally
be broken down into these sub-components:

- min: basic, minimal starting template; hello world.
- basic: A single record, basic template.
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
in ways that will break modularity.  For real projects, I would
recommend one of the other Actix-Web starter app templates.

Takeaway:
- Thematic building-blocks are a very useful starting point; perhaps moreso than
  general-purpose frameworks.  
- Composing projects was not that easy; for the most part, rust modules played 
  nicely together, but JS and template dependencies should be managed differently.
  Possibly embedded into libraries as defaults using `rust-embed` or similar. 


