# Changelog

Record of bug fixes, enhancements, and changes.

## [1.1.1] – 2022-06-23

### Fixed
- Fixed regular expression to correctly detect new flags.

## [1.1.0] – 2022-06-23

### Added
- The text search now supports a global flag (`@/text/g`). The `g` flag will add the callout to all the lines that match the search criteria. Use wisely.
- Added the `i` flag for case-insensitive searches: (`@/text/i`). Again, don't go mad.

## [1.0.0] – 2022-06-16

### Added
- Added roles to the source block and the callout list so that CSS folk can pick them out to make style changes (For example, adjusting the gap between callout items in the source code block.)

## [0.0.6-beta6] – 2022-06-11

### Changed
- Ordered lists were only processes if they occurred directly beneath a source listing block. This turns out to be quite restrictive, and doesn't follow Asciidoc's stance on processing standard callouts, which allows for intermediate blocks to separate the source list from the attached callout list.\
The processor will now allow intermediate blocks to separate the source listing from the ordered list containing callouts.
- Fixed  a few spelling mistakes and a code line where I was picking up a formatted item, rather than a raw item.

