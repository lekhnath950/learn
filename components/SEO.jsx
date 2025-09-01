/* Simple JSON-LD injector */
export default function SEO({ jsonld = {} }){
  const content = JSON.stringify(jsonld, null, 2);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
