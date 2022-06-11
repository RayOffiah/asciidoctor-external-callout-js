# Changelog

Record of bug fixes, enhancements, and changes.

## [0.0.6-beta6] – 2022-06-11

### Changed

- Ordered lists were only processes if they occurred directly beneath a source listing block. This turns out to be quite restrictive, and doesn't follow Asciidoc's stance on processing standard callouts, which allows for intermediate blocks to separate the source list from the attached callout list.\
The processor will now allow intermediate blocks to separate the source listing from the ordered list containing callouts.
- Fixed  a few spelling mistakes and a code line where I was picking up a formatted item, rather than a raw item.

