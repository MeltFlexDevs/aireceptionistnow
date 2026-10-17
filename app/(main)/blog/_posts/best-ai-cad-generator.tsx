import {
  Lead,
  P,
  H2,
  H3,
  UL,
  LI,
  Strong,
  Ext,
  Callout,
  KeyTakeaways,
  FAQList,
  Figure,
  Table,
  Sources,
  type Source,
  type FaqItem,
} from "../_components/prose";

export const meta = {
  slug: "best-ai-cad-generator",
  title: "The 9 Best AI CAD Generators in 2026, Ranked",
  description:
    "Nine AI CAD generators ranked on what they actually hand you: a drawing a shop can use, a STEP solid, a SolidWorks part or just a mesh. One tested, prices checked October 2026.",
  date: "2026-10-17",
  updated: "2026-10-17",
  readingTime: "13 min read",
  tag: "Guides",
  hero: "/blog/best-ai-cad-generator-collage.webp",
  heroAlt:
    "A collage of the homepages of the nine AI CAD generators in this ranking, each in a browser window numbered by rank, with TechDraw AI large in the centre as number one",
  heroWidth: 1600,
  heroHeight: 900,
  keywords: [
    "best ai cad generator",
    "ai cad generator",
    "ai cad generator free",
    "text to cad",
    "text to cad ai",
    "ai cad tools",
    "ai cad software",
    "image to cad ai",
    "photo to cad",
    "ai 3d cad generator",
    "zoo text to cad alternatives",
    "techdraw ai",
  ],
  sections: [
    { id: "short-answer", title: "The short answer" },
    { id: "what-you-get", title: "First: what does it hand you?" },
    { id: "how-we-ranked", title: "How we ranked them" },
    { id: "at-a-glance", title: "The ranking at a glance" },
    { id: "ranking", title: "The 9 generators, one by one" },
    { id: "prices", title: "What they cost" },
    { id: "left-out", title: "Tools we left out, and why" },
    { id: "how-to-choose", title: "How to pick in five minutes" },
    { id: "faq", title: "FAQ" },
  ],
  itemList: [
    {
      name: "TechDraw AI",
      description:
        "Best overall. Turns a photo, a sketch or a one-sentence description into a dimensioned multi-view technical drawing, with DXF and DWG export and photo-to-3D meshes. One free drawing; Starter €29/month or €11/month yearly, Studio €89/month or €49/month yearly.",
      url: "https://techdrawai.com/",
    },
    {
      name: "Zoo Design Studio",
      description:
        "Best for parametric solids from a prompt. Zookeeper builds editable B-rep models as KCL code and exports STEP. Free tier of about 20 minutes a month; Plus $20/month.",
      url: "https://zoo.dev/",
    },
    {
      name: "Backflip AI",
      description:
        "Best for reverse engineering. Rebuilds drawings, scans and photos as feature-tree CAD inside Autodesk Fusion. 50 free credits; Builder $20/month.",
      url: "https://www.backflip.ai/",
    },
    {
      name: "MecAgent",
      description:
        "Best for SolidWorks users. Generates native parts, assemblies and drawings inside SolidWorks from text or a spec sheet. 11 free runs; Starter $84/month.",
      url: "https://mecagent.com/",
    },
    {
      name: "Claude with CadQuery or OpenSCAD",
      description:
        "Best free parametric route for people who can read code. The model writes CadQuery or OpenSCAD scripts that export STEP or STL. Free plan; Pro $20/month or $17/month yearly.",
      url: "https://claude.com/",
    },
    {
      name: "CADAM by Adam",
      description:
        "Best for quick printable parts. Open-source text and image to OpenSCAD with dimension sliders, exporting STL, SCAD and DXF. Adam Pro $40/month.",
      url: "https://adam.new/cadam",
    },
    {
      name: "Autodesk Fusion",
      description:
        "Best if you already model in Fusion. Autodesk Assistant turns typed requests into native, parametric Fusion operations. $85/month or $680/year.",
      url: "https://www.autodesk.com/products/fusion-360/overview",
    },
    {
      name: "Vizcom",
      description:
        "Best for concept design. Sketch or prompt to render and to a 3D mesh, not editable CAD. 800 free credits; Professional $49/user/month.",
      url: "https://www.vizcom.com/",
    },
    {
      name: "Meshy",
      description:
        "Best for 3D-printed figures and visual assets. Text or image to a textured mesh, with no dimensions and no STEP. 100 free credits a month; Pro €19/month.",
      url: "https://www.meshy.ai/",
    },
  ],
  faqs: [
    {
      q: "What is the best AI CAD generator in 2026?",
      a: "For most people, TechDraw AI: it turns a photo, a sketch or a sentence into a dimensioned technical drawing in about a minute, exports DXF and DWG on its Studio plan, and also turns a photo or a drawing into a 3D mesh. If you need an editable parametric solid and a STEP file from a text prompt, Zoo Design Studio is the better pick. If you work in SolidWorks, MecAgent generates parts inside it, and if you work in Fusion, Backflip rebuilds scans and drawings as feature-tree CAD there.",
    },
    {
      q: "Is there a free AI CAD generator?",
      a: "Yes, with limits. TechDraw AI gives a new account one drawing as a watermarked PNG. Zoo's free tier gives about 20 minutes of its Zookeeper agent a month, and Zoo trains on free users' data. Backflip gives 50 trial credits, MecAgent 11 runs, Vizcom 800 credits and Meshy 100 credits a month. Claude's free plan can write CadQuery or OpenSCAD scripts, and both of those are free and open source, so that route costs nothing if you can run code.",
    },
    {
      q: "Can AI generate a STEP file from a text prompt?",
      a: "Yes. Zoo Design Studio builds a parametric B-rep model from a prompt and exports STEP. Claude or ChatGPT can write a CadQuery script that exports STEP when you run it. MecAgent generates native SolidWorks parts, which SolidWorks can save as STEP. Mesh generators such as Meshy, Tripo and Vizcom cannot: their output is triangles, and converting a mesh to STEP does not give you editable features.",
    },
    {
      q: "Can AI turn a photo of a part into a CAD file?",
      a: "Yes, in two different ways. TechDraw AI turns a photo into a dimensioned 2D drawing with DXF and DWG export, and into a 3D mesh; you supply one real measurement to set the scale. Backflip rebuilds phone photos plus one known dimension, or a 3D scan, as a parametric model with a feature tree in Autodesk Fusion. A single photo cannot show true size or hidden features, so measure anything that has to fit another part.",
    },
    {
      q: "Can ChatGPT or Claude make CAD models?",
      a: "Not directly, but they can write the code that makes one. Ask for a CadQuery (Python) or OpenSCAD script, run it, and you get a STEP or STL file. It works well for simple parametric parts and badly for anything the model cannot see, because it gets no picture of the result unless you add tools for that. Onshape's official FeatureScript MCP server also lets Claude, ChatGPT or Gemini write native Onshape features.",
    },
    {
      q: "Are text-to-3D tools like Meshy real CAD?",
      a: "No. Meshy, Tripo and Vizcom's 3D mode produce textured triangle meshes: good for 3D-printed figurines, renders, games and AR, but with no dimensions, no feature tree and no STEP export. For a part that has to be machined or fit another part, you need a drawing or a parametric model, from a tool like TechDraw AI, Zoo, Backflip or MecAgent.",
    },
    {
      q: "Is AI-generated CAD accurate enough to manufacture?",
      a: "Treat it as a fast first draft, not a released drawing. In our test, TechDraw AI used every size we gave it but drew an M5 clearance hole at Ø5 rather than Ø5.5. Every tool here makes mistakes like that. Check each dimension, tolerance and fit against your requirements, and have someone qualified sign off anything safety-critical, before you send it to a shop.",
    },
  ] satisfies FaqItem[],
};

const sources: Source[] = [
  {
    title: "TechDraw AI: plans, tools and limits (llms.txt, read 17 Oct 2026)",
    url: "https://techdrawai.com/llms.txt",
  },
  {
    title: "TechDraw AI: text to technical drawing (read 17 Oct 2026)",
    url: "https://techdrawai.com/text-to-technical-drawing",
  },
  {
    title: "Zoo: pricing (read 17 Oct 2026)",
    url: "https://zoo.dev/zoo-pricing",
  },
  {
    title: "Zoo: Text-to-CAD documentation",
    url: "https://zoo.dev/docs/zoo-design-studio/text-to-cad",
  },
  {
    title: "Zoo: what's new, March 2026",
    url: "https://zoo.dev/blog/whats-new-mar-2026",
  },
  {
    title: "Backflip AI: pricing (read 17 Oct 2026)",
    url: "https://www.backflip.ai/pricing",
  },
  {
    title: "Autodesk: Backflip add-in for Autodesk Fusion",
    url: "https://www.autodesk.com/products/fusion-360/blog/backflip-add-in-autodesk-fusion/",
  },
  {
    title: "Fabbaloo: hands-on with Backflip",
    url: "https://www.fabbaloo.com/?p=239558",
  },
  {
    title: "MecAgent: pricing (read 17 Oct 2026)",
    url: "https://mecagent.com/pricing",
  },
  {
    title: "Claude: plans and pricing (read 17 Oct 2026)",
    url: "https://claude.com/pricing",
  },
  {
    title: "PTC: Onshape launches FeatureScript MCP server",
    url: "https://www.ptc.com/en/news/2026/onshape-launches-featurescript-mcp-server",
  },
  {
    title: "Adam: pricing (read 17 Oct 2026)",
    url: "https://adam.new/pricing",
  },
  {
    title: "CADAM: open-source repository",
    url: "https://github.com/Adam-CAD/CADAM",
  },
  {
    title:
      "TechCrunch: Adam raises $4.1M to turn its text-to-3D tool into a CAD copilot",
    url: "https://techcrunch.com/2025/10/31/yc-alum-adam-raises-4-1m-to-turn-viral-text-to-3d-tool-into-ai-copilot/",
  },
  {
    title: "Autodesk: Fusion pricing (read 17 Oct 2026)",
    url: "https://www.autodesk.com/products/fusion-360/pricing",
  },
  {
    title: "Autodesk: Autodesk Assistant enters a new era",
    url: "https://www.autodesk.com/products/fusion-360/blog/autodesk-assistant-enters-a-new-era/",
  },
  {
    title: "Autodesk: Fusion roadmap 2026",
    url: "https://www.autodesk.com/products/fusion-360/blog/fusion-roadmap-2026/",
  },
  {
    title: "Vizcom: pricing (read 17 Oct 2026)",
    url: "https://www.vizcom.com/pricing",
  },
  {
    title: "Vizcom: export formats",
    url: "https://docs.vizcom.com/export-panel",
  },
  {
    title: "Meshy: pricing (read 17 Oct 2026)",
    url: "https://www.meshy.ai/pricing",
  },
  {
    title: "Tripo: pricing (read 17 Oct 2026)",
    url: "https://www.tripo3d.ai/pricing",
  },
];

export default function Body() {
  return (
    <>
      <Lead>
        &quot;AI CAD generator&quot; covers four very different kinds of tool,
        and most lists mix them up. Some hand you a dimensioned drawing a
        machinist can work from. Some hand you an editable solid with a feature
        tree. Some work inside SolidWorks or Fusion. And some hand you a pretty
        mesh with no dimensions at all. We sorted nine of them by what they
        actually give you, tested our top pick on a real part, and read every
        vendor&apos;s own pricing page on 17 October 2026.
      </Lead>

      <KeyTakeaways
        items={[
          <>
            <Strong>TechDraw AI is our top pick</Strong> for most people. A
            photo, a sketch or one sentence becomes a dimensioned multi-view
            drawing in about a minute, with DXF and DWG export and photo to 3D.
            The first drawing is free.
          </>,
          <>
            For an <Strong>editable STEP solid from a text prompt</Strong>, use
            Zoo Design Studio. It is the purest text-to-CAD tool on the list.
          </>,
          <>
            Already in <Strong>SolidWorks or Fusion</Strong>? MecAgent works
            inside SolidWorks; Backflip and Autodesk Assistant work inside
            Fusion.
          </>,
          <>
            <Strong>Meshy and Vizcom are not CAD.</Strong> They make meshes:
            fine for printing figures and renders, useless for a part that has
            to fit.
          </>,
          <>
            <Strong>Every tool here makes mistakes.</Strong> Ours drew an M5
            clearance hole at Ø5. Check the numbers before you cut metal.
          </>,
        ]}
      />

      <H2 id="short-answer">The short answer</H2>
      <P>
        If you have a part, a sketch or a sentence and need a drawing or a DXF
        you can send to a shop, a laser or AutoCAD, use{" "}
        <Ext href="https://techdrawai.com/">TechDraw AI</Ext>. If you want a
        parametric solid you can keep editing, use Zoo Design Studio. If you
        live in SolidWorks, try MecAgent; if you live in Fusion, Backflip. If
        you can read Python and want to pay nothing, ask Claude to write
        CadQuery. Everything else on this list is a good tool for a narrower
        job, and we say which.
      </P>

      <H2 id="what-you-get">First: what does it hand you?</H2>
      <P>
        This is the question that sorts the whole category, so answer it before
        you compare prices.
      </P>
      <UL>
        <LI>
          <Strong>A 2D technical drawing</Strong> (PDF, DXF, DWG): views,
          dimensions, a title block. This is what a machine shop, a fabricator
          or a laser cutter needs. TechDraw AI.
        </LI>
        <LI>
          <Strong>A parametric solid</Strong> (STEP, native CAD): an editable
          model with a feature tree, where changing one size updates the part.
          Zoo, Backflip, MecAgent, CadQuery.
        </LI>
        <LI>
          <Strong>Commands inside your CAD program</Strong>: the AI drives
          SolidWorks or Fusion for you. MecAgent, Autodesk Assistant, the Adam
          copilot.
        </LI>
        <LI>
          <Strong>A mesh</Strong> (STL, GLB, OBJ): triangles with no dimensions
          and no features. Good for 3D printing a figure, a render or a game,
          not for engineering. Meshy, Vizcom, Tripo, and the 3D models from
          TechDraw AI.
        </LI>
      </UL>

      <H2 id="how-we-ranked">How we ranked them</H2>
      <P>We scored every tool on five things, in this order of weight:</P>
      <UL>
        <LI>
          <Strong>Is the output usable?</Strong> Can a shop, a CAD program or a
          printer use what comes out, without redrawing it?
        </LI>
        <LI>
          <Strong>What can you give it?</Strong> Text, a photo, a hand sketch,
          an old drawing, a scan. The more of the inputs you actually have, the
          better.
        </LI>
        <LI>
          <Strong>Does it use your numbers, and can you fix its?</Strong> A
          generator that ignores the sizes you typed, or that you cannot
          correct, is a toy.
        </LI>
        <LI>
          <Strong>What does real use cost?</Strong> Including the plan you need
          for the file format you need.
        </LI>
        <LI>
          <Strong>How much do you need to know?</Strong> Some of these need a
          CAD seat, a Windows PC or Python. Some need a browser.
        </LI>
      </UL>
      <Callout>
        <Strong>What we did and didn&apos;t do.</Strong> We ran TechDraw AI on a
        one-sentence description of a real part and show the result below,
        mistakes included. For the other eight we read each vendor&apos;s own
        pricing, product and documentation pages on 17 October 2026, plus the
        hands-on reviews we cite. Where a vendor doesn&apos;t publish a number,
        we say so rather than guess. Prices change often; check before you buy.
      </Callout>

      <H2 id="at-a-glance">The ranking at a glance</H2>
      <Table
        caption="Prices as listed on each vendor's own page, 17 October 2026"
        head={["#", "Tool", "Best for", "You get", "Free option", "Paid from"]}
        rows={[
          [
            "1",
            "TechDraw AI",
            "Drawings and DXF from a photo, sketch or sentence",
            "Dimensioned drawing, DXF/DWG, 3D mesh",
            "1 drawing (PNG)",
            "€11/mo yearly, €29 monthly",
          ],
          [
            "2",
            "Zoo Design Studio",
            "Parametric solids from a prompt",
            "Editable B-rep, STEP",
            "~20 min/month",
            "$20/mo",
          ],
          [
            "3",
            "Backflip AI",
            "Reverse engineering in Fusion",
            "Feature-tree CAD",
            "50 credits",
            "$20/mo",
          ],
          [
            "4",
            "MecAgent",
            "SolidWorks users",
            "Native SolidWorks parts, assemblies, drawings",
            "11 runs",
            "$84/mo",
          ],
          [
            "5",
            "Claude + CadQuery",
            "Free parametric parts, if you code",
            "Script that exports STEP or STL",
            "Free plan",
            "$17/mo yearly, $20 monthly",
          ],
          [
            "6",
            "CADAM by Adam",
            "Quick printable parts",
            "OpenSCAD model, STL",
            "Light daily quota",
            "$40/mo (Adam Pro)",
          ],
          [
            "7",
            "Autodesk Fusion",
            "Existing Fusion users",
            "Native Fusion operations",
            "30-day trial",
            "$57/mo yearly, $85 monthly",
          ],
          [
            "8",
            "Vizcom",
            "Concept and industrial design",
            "Renders, 3D mesh",
            "800 credits",
            "$49/user/mo",
          ],
          [
            "9",
            "Meshy",
            "Printed figures, visual assets",
            "Textured mesh",
            "100 credits/month",
            "€19/mo",
          ],
        ]}
      />

      <H2 id="ranking">The 9 generators, one by one</H2>

      <H3>1. TechDraw AI: best overall</H3>
      <Figure
        src="/blog/ai-cad-tool-techdraw.webp"
        alt='TechDraw AI homepage: "From sketch to a CAD drawing in seconds with AI", a photo upload box, and a dimensioned multi-view drawing of a sofa with top, front and side views'
        width={1600}
        height={895}
        caption="techdrawai.com, homepage as of 17 October 2026."
      />
      <P>
        TechDraw AI does the job most people searching this term actually have:
        there is a part, a sketch or an idea, and you need a drawing someone can
        make it from. Upload a photo or a hand sketch and it lays out front, top
        and side views with dimension lines and an ISO, ANSI or DIN title block.
        You give it one real measurement, a caliper reading for example, and
        that sets the scale for the rest. Or skip the photo and describe the
        part in a sentence: plates, flanges, shafts, bushings and brackets come
        back as a dimensioned sheet.
      </P>
      <P>
        It covers more of the chain than anything else here. The same account
        turns a photo or an existing drawing into a 3D model (GLB, STL, OBJ,
        FBX, USDZ) in about two minutes, and a drawing into a photorealistic
        product render. DXF and DWG open directly in AutoCAD, and import into a
        Fusion, SolidWorks, Inventor or Onshape sketch to extrude. For
        developers there is a REST API, a CLI and an MCP server, so Claude or
        Cursor can call it. No CAD skills are needed to use any of it.
      </P>
      <Figure
        src="/blog/ai-cad-techdraw-text-to-drawing-test.webp"
        alt="A TechDraw AI drawing of an aluminium 6061 mounting plate, 120 by 80 by 6 mm, with top, front, side and isometric views, four holes labelled 4 x Ø5, a centre bore labelled Ø22 H7, 1 x 45° chamfers and an A3 title block"
        width={1600}
        height={1120}
        caption="Our test, 17 October 2026: one sentence in, this sheet out, as it came back."
      />
      <P>
        <Strong>Our test.</Strong> We typed: &quot;Aluminium 6061 mounting
        plate, 120 x 80 mm, 6 mm thick. Four M5 clearance holes 8 mm in from
        each corner, a 22 mm H7 bore in the centre, all edges 1 mm
        chamfer.&quot; Under a minute later, for 5 credits, we had an A3 sheet
        with front, top, side and isometric views, every size we gave on the
        drawing (120, 80, 6, the 8 mm hole positions, Ø22 H7, the 1 × 45°
        chamfer), hidden lines for the holes and a filled-in title block.
      </P>
      <P>
        It was not perfect, and you should know where. It drew the M5 clearance
        holes as Ø5, the bare bolt size, which a bolt will not pass through: a
        medium-fit M5 clearance is Ø5.5 (ISO 273). It placed the top view above
        the front view, which is third-angle layout, under a first-angle
        projection symbol. The H7 bore came without its limits, and no list of
        assumed values appeared on our result, though the product page promises
        one. All of it takes a minute to fix in the built-in &quot;Edit
        numbers/text&quot; editor, which is free, but you have to spot it first.
      </P>
      <P>
        <Strong>Price:</Strong> a new account gets 5 free credits, enough for
        one drawing, downloaded as a watermarked PNG. Starter is €29 a month, or
        €11 a month billed yearly (€132), for 120 credits, about 24 drawings or
        renders, without a watermark, as PNG. Studio is €89 a month, or €49 a
        month yearly (€588), for 750 credits, and adds DXF, DWG, SVG and vector
        PDF export, the two 3D tools (a 3D model costs 80 credits, so up to 9 a
        month) and the API. USD and other currencies are shown at checkout.
      </P>
      <P>
        <Strong>Where it falls short:</Strong> the CAD files are Studio-only, so
        the €29 plan gives you pictures of drawings, not DXF. The DXF and DWG
        are traced from the sheet, so they arrive as lines, arcs and text, not
        as native dimension entities; check the scale against one known size
        when you import. The 3D output is a mesh, not a parametric solid, with
        no feature tree; STEP only comes via a separate STL-to-STEP converter.
        And the user figures on the site (156,000+ users, 4.8 from 1,200+
        reviews) are its own, not independently audited.
      </P>
      <P>
        <Strong>Best for:</Strong> engineers, fabricators, makers and
        woodworkers who need a drawing or a cut file today, reverse engineering
        a part with no documentation, and anyone who doesn&apos;t use CAD but
        has to send a drawing to someone who does.
      </P>

      <H3>2. Zoo Design Studio: best for parametric solids from a prompt</H3>
      <Figure
        src="/blog/ai-cad-tool-zoo.webp"
        alt='Zoo homepage: "The AI-native engineering platform", with Download and Try in browser buttons for Zoo Design Studio'
        width={1600}
        height={895}
        caption="zoo.dev, homepage as of 17 October 2026."
      />
      <P>
        Zoo, formerly KittyCAD, is the closest thing to true text-to-CAD you can
        use today. Its Zookeeper agent, launched in February 2026, takes a
        prompt, and since March an image, a sketch photo or a PDF or DXF
        drawing, and builds a parametric B-rep model. The model is written as
        KCL code with a feature tree, so you can edit it by changing the code or
        the features. It exports STEP, STL, OBJ, PLY, glTF and FBX, runs in the
        browser or as a desktop app, and has an API.
      </P>
      <P>
        <Strong>Price:</Strong> free gives about 20 minutes of Zookeeper a month
        (a $10 credit shared with the API). Plus is $20 a month for about 400
        minutes, Pro $99 a month for unlimited Zookeeper in the app, Team $399
        per user. Pay-as-you-go is about $0.50 a minute. The annual toggle
        didn&apos;t change the prices when we checked.
      </P>
      <P>
        <Strong>Where it falls short:</Strong> on the free plan Zoo trains on
        your data with no opt-out; you need Plus to opt out. Twenty minutes goes
        fast. It is a separate CAD system, so your models live outside
        SolidWorks or your PDM. Results are hit and miss on complex prompts,
        which Zoo&apos;s own forum is frank about. And it does not make 2D
        manufacturing drawings the way #1 does.
      </P>
      <P>
        <Strong>Best for:</Strong> engineers and serious hobbyists who want an
        editable solid and a STEP file from a description.
      </P>

      <H3>3. Backflip AI: best for reverse engineering</H3>
      <Figure
        src="/blog/ai-cad-tool-backflip.webp"
        alt='Backflip AI homepage: "3D design for everyone. The AI copilot that CADs like a human", with a render of a V-engine model'
        width={1600}
        height={895}
        caption="backflip.ai, homepage as of 17 October 2026."
      />
      <P>
        Backflip, from the co-founders of Markforged, rebuilds what already
        exists. Give it a 2D engineering drawing, a 3D scan or a few phone
        photos plus one known dimension, and it reconstructs the part as a
        parametric model from real CAD operations, extrudes, revolves, patterns,
        fillets, with sketches and constraints you can edit. It ships as an
        Autodesk Fusion add-in, generally available since August 2026, and as a
        web app; Onshape is listed as coming soon.
      </P>
      <P>
        <Strong>Price:</Strong> 50 free trial credits with no card. Builder is
        $20 a month for 100 credits, Pro $50 for 300, Business $380 for 2,500. A
        fast job costs 10 credits and a &quot;thinking&quot; job 50, so Builder
        is 2 to 10 parts a month. Monthly credits don&apos;t roll over.
      </P>
      <P>
        <Strong>Where it falls short:</Strong> it is not a text-prompt
        generator. Backflip says it works best on moderately complex milled or
        turned parts, and a hands-on test by Fabbaloo found it missed faint
        raised panels on a rough scan. Its pricing page lists no export formats,
        and we found no independent accuracy benchmark.
      </P>
      <P>
        <Strong>Best for:</Strong> Fusion users digitising legacy parts or a
        drawer full of old paper drawings.
      </P>

      <H3>4. MecAgent: best for SolidWorks users</H3>
      <Figure
        src="/blog/ai-cad-tool-mecagent.webp"
        alt='MecAgent homepage: "AI for CAD. An AI copilot that generates parts, assemblies and drawings from text or a spec sheet, right in SolidWorks", next to a SolidWorks window with a bike frame model'
        width={1600}
        height={895}
        caption="mecagent.com, homepage as of 17 October 2026."
      />
      <P>
        MecAgent is an agent that drives SolidWorks for you. Describe a part or
        paste a spec sheet and it builds native parts, assemblies and drawings
        (SLDPRT, SLDASM, SLDDRW, with DXF export), live in your session or as a
        background task while you work. It also turns drawings into models,
        models into drawings, and writes macros.
      </P>
      <P>
        <Strong>Price:</Strong> free gives 11 agentic runs and 2 macros, with no
        drawing-to-CAD. Starter is $84 a month for 40 runs, 1 drawing-to-CAD and
        2 CAD-to-drawing jobs. Advanced+ is $417 a month per seat. Yearly
        billing saves about 17%, and students get a free plan.
      </P>
      <P>
        <Strong>Where it falls short:</Strong> SolidWorks 2024 to 2026 on
        Windows only; every other CAD system is marked &quot;soon&quot;. The
        paid tiers are expensive for what they allow: one drawing-to-CAD job a
        month on an $84 plan is tight.
      </P>
      <P>
        <Strong>Best for:</Strong> SolidWorks users who want generation inside
        the files and PDM they already have.
      </P>

      <H3>5. Claude with CadQuery or OpenSCAD: best free parametric route</H3>
      <Figure
        src="/blog/ai-cad-tool-claude.webp"
        alt='Claude homepage: "Think fast, build faster", with sign-in buttons and a preview of a generated document'
        width={1600}
        height={895}
        caption="claude.com, homepage as of 17 October 2026."
      />
      <P>
        A general model like Claude can&apos;t output a CAD file itself, but it
        writes the code that makes one very well. Ask for a CadQuery script
        (Python) and you get a STEP file when you run it; ask for OpenSCAD and
        you get an STL. Everything stays parametric and versionable: change one
        variable, re-run, done. Since August 2026, Onshape&apos;s official
        FeatureScript MCP server also lets Claude, ChatGPT or Gemini write and
        debug native Onshape features.
      </P>
      <P>
        <Strong>Price:</Strong> Claude has a free plan; Pro is $20 a month, or
        $17 a month billed yearly. CadQuery and OpenSCAD are free and open
        source. ChatGPT works the same way; we couldn&apos;t load its pricing
        page to confirm today&apos;s price.
      </P>
      <P>
        <Strong>Where it falls short:</Strong> the model can&apos;t see the
        geometry it writes unless you add tools for that, so errors go unnoticed
        until you render it. OpenSCAD in particular can fail silently. You need
        to install and run the code yourself, and anything beyond simple
        prismatic parts gets slow.
      </P>
      <P>
        <Strong>Best for:</Strong> programmers and makers who want parametric
        parts for free.
      </P>

      <H3>6. CADAM by Adam: best for quick printable parts</H3>
      <Figure
        src="/blog/ai-cad-tool-cadam.webp"
        alt='CADAM by Adam: a dark page saying "Good afternoon!" with a prompt box reading "Start building with Adam" and a Mesh option'
        width={1600}
        height={895}
        caption="adam.new/cadam, as of 17 October 2026."
      />
      <P>
        Adam went viral in 2025 for text-to-3D, then pivoted: adam.new is now an
        AI workspace for hardware teams that edits existing models in Onshape,
        Fusion and SolidWorks. The original generator lives on as CADAM, open
        source under GPL-3.0. Type a description or add a reference image and it
        writes an OpenSCAD model with sliders for each dimension, exported as
        STL, SCAD or DXF.
      </P>
      <P>
        <Strong>Price:</Strong> Adam&apos;s free plan has a &quot;light daily
        quota&quot; on its Lite model; Pro is $40 a month with a 7-day trial,
        Max $200. CADAM&apos;s own limits aren&apos;t published, and you can
        self-host the open-source code.
      </P>
      <P>
        <Strong>Where it falls short:</Strong> OpenSCAD output is aimed at
        printing, so no STEP. You need to sign in to generate. And because of
        the pivot, most reviews you&apos;ll find describe a product that no
        longer exists in that form.
      </P>
      <P>
        <Strong>Best for:</Strong> 3D-printing hobbyists who want a bracket or a
        box with adjustable sizes, fast.
      </P>

      <H3>7. Autodesk Fusion: best if you already use Fusion</H3>
      <Figure
        src="/blog/ai-cad-tool-fusion.webp"
        alt="Autodesk Fusion overview page with a multi-seat discount banner and a render of a racing steering wheel"
        width={1600}
        height={895}
        caption="autodesk.com/products/fusion-360, as of 17 October 2026."
      />
      <P>
        Fusion&apos;s AI is real but incremental. Since March 2026, Autodesk
        Assistant takes a typed request (&quot;a box 80 by 40 by 20&quot;,
        &quot;fillet these edges&quot;, &quot;set up a toolpath&quot;) and runs
        the native Fusion operations, history kept. Generative design produces
        shapes from loads and constraints. And Fusion is becoming a hub for
        others&apos; AI: Backflip runs inside it.
      </P>
      <P>
        <Strong>Price:</Strong> $85 a month, or $680 a year ($57 a month).
        Fusion for Manufacturing is $2,040 a year and Fusion for Design $2,190.
        There is a 30-day free trial.
      </P>
      <P>
        <Strong>Where it falls short:</Strong> the Assistant automates commands;
        it doesn&apos;t generate a whole part from a description.
        Autodesk&apos;s &quot;neural CAD&quot; for text-to-geometry was
        announced for 2026 but hadn&apos;t shipped when we checked. Generative
        design costs extra and its organic shapes often need rework before they
        can be made.
      </P>
      <P>
        <Strong>Best for:</Strong> people already paying for Fusion. Not a
        reason to start.
      </P>

      <H3>8. Vizcom: best for concept design</H3>
      <Figure
        src="/blog/ai-cad-tool-vizcom.webp"
        alt='Vizcom homepage: "Make it real", with a design studio scene and a clay car model'
        width={1600}
        height={895}
        caption="vizcom.com, homepage as of 17 October 2026."
      />
      <P>
        Vizcom is built for industrial and product designers. Draw a sketch or
        type a prompt and it renders it, varies it and turns it into a 3D model.
        The 3D comes out as a mesh, GLB, STL, USDZ, OBJ or FBX, which is right
        for concept reviews and wrong for manufacturing.
      </P>
      <P>
        <Strong>Price:</Strong> the free Starter plan has 800 credits, about 200
        images or 20 models. Professional is $49 per user a month for 20,000
        credits; the page doesn&apos;t say whether that is the monthly or yearly
        rate, and yearly saves 30%. Education is free.
      </P>
      <P>
        <Strong>Where it falls short:</Strong> no dimensions, no STEP, no
        feature tree. Everything has to be rebuilt in CAD before it can be made.
      </P>
      <P>
        <Strong>Best for:</Strong> designers at the sketch-and-render stage.
      </P>

      <H3>9. Meshy: best for printed figures and visual assets</H3>
      <Figure
        src="/blog/ai-cad-tool-meshy.webp"
        alt='Meshy homepage: "Turn sketches or images into printable 3D models", surrounded by 3D-printed figurines'
        width={1600}
        height={895}
        caption="meshy.ai, homepage as of 17 October 2026."
      />
      <P>
        Meshy is on this list because it shows up in every &quot;AI CAD&quot;
        search, and you should know what it is: a text-or-image-to-3D mesh
        generator. The textured models (GLB, FBX, OBJ, STL, USDZ) look great and
        print well as figurines, props and game assets. They are not CAD.
      </P>
      <P>
        <Strong>Price:</Strong> free gives 100 credits a month, with models
        under a CC BY 4.0 licence and 10 downloads. Pro is €19 a month for 1,000
        credits and Premium €38 for 3,000 (prices shown to us in euros; a
        first-month discount was running).
      </P>
      <P>
        <Strong>Where it falls short:</Strong> no dimensions, no accuracy, no
        STEP; meshes are not always watertight. The free tier was halved in
        August 2026.
      </P>
      <P>
        <Strong>Best for:</Strong> 3D-printed figures, renders, games and AR.
      </P>

      <H2 id="prices">What they cost</H2>
      <P>
        Per-credit pricing makes like-for-like comparisons hard, so here is the
        cheapest way into real use for each, and what that buys.
      </P>
      <Table
        caption="Cheapest regular paid plan, as listed 17 October 2026"
        head={["Tool", "Monthly", "Yearly (per month)", "What you get"]}
        rows={[
          [
            "TechDraw AI",
            "€29 (Starter)",
            "€11",
            "About 24 drawings, PNG; DXF/DWG need Studio (€89, or €49 yearly)",
          ],
          [
            "Zoo Design Studio",
            "$20 (Plus)",
            "not shown",
            "About 400 min of Zookeeper",
          ],
          [
            "Backflip AI",
            "$20 (Builder)",
            "not shown",
            "100 credits, 2 to 10 parts",
          ],
          [
            "MecAgent",
            "$84 (Starter)",
            "about 17% less",
            "40 runs, 1 drawing-to-CAD",
          ],
          [
            "Claude + CadQuery",
            "$20 (Pro)",
            "$17",
            "Unlimited scripts within usage limits",
          ],
          [
            "CADAM by Adam",
            "$40 (Adam Pro)",
            "not shown",
            "Higher limits than free",
          ],
          [
            "Autodesk Fusion",
            "$85",
            "$57",
            "Full Fusion with Autodesk Assistant",
          ],
          [
            "Vizcom",
            "$49 per user",
            "30% less",
            "20,000 credits, about 500 models",
          ],
          ["Meshy", "€19 (Pro)", "not checked", "1,000 credits"],
        ]}
      />

      <H2 id="left-out">Tools we left out, and why</H2>
      <UL>
        <LI>
          <Strong>Leo AI.</Strong> A useful engineering assistant for part
          search, calculations and questions about your PDM, but not a CAD
          generator, and it publishes no prices.
        </LI>
        <LI>
          <Strong>Tripo.</Strong> A strong mesh generator, very like Meshy: 200
          free credits a month (about 13 models, non-commercial), Pro $20 a
          month. Same limits, no CAD.
        </LI>
        <LI>
          <Strong>SOLIDWORKS AURA and Onshape AI Advisor.</Strong> Assistants
          that answer questions. SOLIDWORKS&apos; picture-to-sketch is still a
          Labs beta, and Onshape&apos;s Advisor makes no geometry.
        </LI>
        <LI>
          <Strong>Sloyd.</Strong> Game-asset meshes; redundant with Meshy and
          Tripo for this list.
        </LI>
        <LI>
          <Strong>Henqo and CADScribe.</Strong> Both are listed in AI-tool
          directories as text-to-CAD, but we couldn&apos;t confirm either is a
          live product: one site refused to load and the other now serves an
          unrelated page.
        </LI>
      </UL>

      <H2 id="how-to-choose">How to pick in five minutes</H2>
      <UL>
        <LI>
          <Strong>
            &quot;I need a drawing or a DXF for a shop, a laser or
            AutoCAD.&quot;
          </Strong>{" "}
          TechDraw AI. Start with the free drawing.
        </LI>
        <LI>
          <Strong>
            &quot;I need an editable STEP solid from a description.&quot;
          </Strong>{" "}
          Zoo Design Studio.
        </LI>
        <LI>
          <Strong>
            &quot;I have an old part or old drawings to digitise.&quot;
          </Strong>{" "}
          TechDraw AI for the drawing, Backflip for a feature-tree model in
          Fusion.
        </LI>
        <LI>
          <Strong>&quot;I work in SolidWorks all day.&quot;</Strong> MecAgent.
        </LI>
        <LI>
          <Strong>&quot;I can code and don&apos;t want to pay.&quot;</Strong>{" "}
          Claude writing CadQuery.
        </LI>
        <LI>
          <Strong>
            &quot;I want something to 3D print, not machine.&quot;
          </Strong>{" "}
          CADAM for functional parts, Meshy for figures.
        </LI>
      </UL>
      <P>
        Whichever you try, give it a part you know and check every number it
        hands back. In our test the sizes we typed were right and the size we
        left to the AI was wrong. That pattern holds across this whole category.
      </P>

      <H2 id="faq">FAQ</H2>
      <FAQList items={meta.faqs} />

      <Sources sources={sources} />
    </>
  );
}
