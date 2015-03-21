import module namespace fs = "http://expath.org/ns/file";

import module namespace json = "http://www.zorba-xquery.com/modules/xqdoc/json" at "json.xq";

declare function local:expand($current, $elms)
{
  for $elm in $elms
  let $id := $elm/@id/string()
  let $label := $elm/@label/string()
  return if($elm instance of element(module)) then
  {
    "label": $label,
    "id": $id,
    "ns": $elm/@ns/string(), 
    "url": "modules/" || replace(replace($elm/@ns/string(), "http://", ""), "/", "_") || ".json"
  }
  else
  {
    "label": $label,
    "id": $id,
    "children": [
      local:expand(($current, $id), $elm/*)
    ]
  }
};

for $file at $i in fs:list(".")
where fs:is-directory($file)
for $name in fs:list($file || "/modules/xml")
let $xqdoc := parse-xml(fs:read-text($file || "/modules/xml/" || $name))
let $html := json:convert($xqdoc/*)
return fs:write-text($file || "/modules/" || substring-before($name, ".xml") || ".json", serialize($html, ()), "UTF-8"); 

{
  "versions":
    [
      for $file at $i in fs:list(".")
      where fs:is-directory($file)
      let $tokens := tokenize($file, "-")
      let $version := $tokens[1]
      let $codename := $tokens[2]
      order by $version descending
      count $c
      return {
        "id": "",
        "latest": $c eq 1,
        "version": $version,
        "codename": $codename,
        "children": [
          let $modules := doc($file || "/modules/modules.xml")/modules/section
          return local:expand((), $modules)
          ,
          if($version gt "2.7") then
          {
            "label": "Data Sources",
            "id": "data-sources",
            "ref": "data-sources"
          }
          else ()
          ,
          if($version gt "2.9") then
          {
            "label": "REST API",
            "id": "api",
            "children": [
              {
                "label": "Authorization API",
                "id": "auth",
                "url": "api/auth.json"
              }
              ,
              {
                "label": "Query API",
                "id": "queries",
                "url": "api/queries.json"
              }
              ,
              {
                "label": "Data Source API",
                "id": "datasources",
                "url": "api/datasources.json"
              },
              if($version gt "3.0") then
              {
                "label": "Job API",
                "id": "jobs",
                "url": "api/jobs.json"
              } else(),
              if($version gt "3.0") then
              {
                "label": "Module API",
                "id": "modules",
                "url": "api/modules.json"
              } else(),
              if($version ge "3.8") then
              {
                "label": "Batch API",
                "id": "batch",
                "url": "api/batch.json"
              } else()
            ]
          }
          else ()
        ]
      }
    ]
}
