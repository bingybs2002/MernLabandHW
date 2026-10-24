# Built-in Classes

### 1. Difference between a normal object {} and Map?

Objects are convenient records with string or symbol keys and prototype behavior. Map is designed for key-value collections, allows keys of any type, preserves insertion order, exposes size, and has explicit iteration methods.

### 2. Is an object ordered? How about a Map instance?

Objects have a defined but specialized property ordering: integer-like keys first, then other string keys by insertion order, then symbols. Map has straightforward insertion order for all keys, so I use it when ordered keyed collections are important.
