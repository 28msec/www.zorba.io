import module namespace file = "http://expath.org/ns/file";

declare function local:visit($prefix, $tree) {
  local:visit($prefix, $tree, ())
};

declare function local:visit($prefix, $tree, $results) {
  let $prefix := $prefix || "/" || $tree("id")
  let $results := ($results, $prefix)
  let $children := $tree("children") ! jn:members(.)
  return if(empty($children)) then
    $results
  else
    for $child in $children
    return local:visit($prefix, $child, $results) 
};

let $entries := doc("blog/atom.xml")//*:entry
let $urls := for $entry in $entries
             return "/blog" || $entry/*:id/text()
let $urls := (
  $urls, 
  for $category in $entries//*:category/@label/string()
  return "/blog/tags/" || $category
)
let $versions := jn:parse-json(file:read-text("documentation/index.json"))("versions") 
let $urls := (
  $urls,
  
  for $version in $versions ! jn:members(.)
  for $child in $version("children") ! jn:members(.)
  return
    local:visit("/documentation/" || $version("version"), $child), 
  
  for $child in $versions(1)("children") ! jn:members(.)
  return
    local:visit("/documentation/latest", $child)
)
let $urls := (
  $urls,
  "/home",
  "/blog/",
  "/documentation",
  "/download"
)
return 
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {
    for $url at $i in distinct-values($urls)
    return <url>
      <loc>http://www.zorba.io{$url}</loc>
    </url>
  }
</urlset>
