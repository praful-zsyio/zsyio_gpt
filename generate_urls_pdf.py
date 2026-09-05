import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Header rule and text (skip on cover page if desired, but we show header cleanly)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#0284c7"))
            self.drawString(54, 755, "ZSYIO GPT - AI MODEL & API KEY REFERENCE DIRECTORY")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(558, 755, "API Configuration Guide")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.75)
            self.line(54, 748, 558, 748)

        # Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#94a3b8"))
        self.drawString(54, 32, "ZsyioGPT Enterprise Platform  *  Confidential & Internal Reference")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(54, 44, 558, 44)
        self.restoreState()


def create_urls_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0369a1'),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=16,
        textColor=colors.HexColor('#475569'),
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )

    link_style = ParagraphStyle(
        'UrlLink',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#0284c7')
    )

    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    code_style = ParagraphStyle(
        'EnvCode',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0369a1')
    )

    story = []

    # Title Banner Block
    banner_data = [
        [
            Paragraph("<b>ZsyioGPT  *  Official AI Models & API Reference Directory</b>", title_style),
        ],
        [
            Paragraph("A comprehensive index of all supported AI providers, direct API key portals, developer consoles, model IDs, documentation, and configuration templates for ZsyioGPT.", subtitle_style)
        ]
    ]
    banner_table = Table(banner_data, colWidths=[504])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0f9ff')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bae6fd')),
        ('PADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 14))

    # Providers Data
    providers = [
        {
            "name": "1. OpenAI (ChatGPT / GPT-4o / o1 / o3-mini)",
            "env_var": "OPENAI_API_KEY",
            "desc": "Primary provider for cutting-edge general reasoning, code generation, audio, and vision intelligence.",
            "recommended": "gpt-4o, gpt-4o-mini, o1-preview, o3-mini",
            "links": [
                ("API Keys Dashboard", "https://platform.openai.com/api-keys", "Create & revoke secret keys"),
                ("Developer Console", "https://platform.openai.com/dashboard", "Project settings, rate limits & usage"),
                ("Billing & Credits", "https://platform.openai.com/settings/organization/billing/overview", "Add funds & credit balance"),
                ("Models Documentation", "https://platform.openai.com/docs/models", "Official model release specs"),
                ("Pricing Details", "https://openai.com/api/pricing/", "Token pricing for input & output")
            ]
        },
        {
            "name": "2. OpenRouter (Unified Multi-Model Gateway)",
            "env_var": "OPENROUTER_API_KEY",
            "desc": "Single unified API key accessing OpenAI, Anthropic Claude, Google Gemini, DeepSeek R1, Meta Llama 3, and Mistral.",
            "recommended": "openai/gpt-4o-mini, anthropic/claude-3.5-sonnet, deepseek/deepseek-r1",
            "links": [
                ("Keys Management", "https://openrouter.ai/keys", "Generate secret key starting with sk-or-v1-"),
                ("Main Dashboard", "https://openrouter.ai/", "Model catalog, rankings & latency"),
                ("Credits & Billing", "https://openrouter.ai/credits", "Fund account via card or crypto"),
                ("All Available Models", "https://openrouter.ai/models", "Browse 100+ active LLMs with pricing"),
                ("Quickstart Docs", "https://openrouter.ai/docs/quick-start", "API schema & standard headers")
            ]
        },
        {
            "name": "3. Anthropic (Claude 3.5 Sonnet / Claude 3 Opus / Haiku)",
            "env_var": "ANTHROPIC_API_KEY (or CLAUDE_API_KEY)",
            "desc": "Industry-leading reasoning, coding capabilities, long 200k context window, and human-aligned outputs.",
            "recommended": "claude-3-5-sonnet-latest, claude-3-5-haiku-latest, claude-3-opus-20240229",
            "links": [
                ("API Keys Console", "https://console.anthropic.com/settings/keys", "Create Claude secret keys (sk-ant-)"),
                ("Anthropic Console", "https://console.anthropic.com/dashboard", "Workspaces, team & rate limit stats"),
                ("Billing Plans", "https://console.anthropic.com/settings/plans", "Prepaid credits & payment methods"),
                ("Model Overview", "https://docs.anthropic.com/en/docs/about-claude/models", "Latency benchmarks & capabilities"),
                ("Claude API Docs", "https://docs.anthropic.com/en/api/getting-started", "Streaming & tool calling guides")
            ]
        },
        {
            "name": "4. Google Cloud & Google AI Studio (Gemini 2.0 / 1.5 Pro / Flash)",
            "env_var": "GEMINI_API_KEY",
            "desc": "Ultra-large 2 Million token context, fast multimodal analysis (text, image, video, audio), with generous free tier.",
            "recommended": "gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash",
            "links": [
                ("Get API Key (AI Studio)", "https://aistudio.google.com/app/apikey", "Instant 1-click free/paid API key creation"),
                ("Google AI Studio", "https://aistudio.google.com/", "Prompt playground & multimodal testing"),
                ("Gemini Models Hub", "https://ai.google.dev/gemini-api/docs/models/gemini", "Context window & technical metrics"),
                ("Google Cloud Console", "https://console.cloud.google.com/", "Enterprise Vertex AI resource manager"),
                ("Gemini API Pricing", "https://ai.google.dev/pricing", "Free tier quotas & paid tier rates")
            ]
        },
        {
            "name": "5. xAI (Grok 2 / Grok 2 Vision)",
            "env_var": "GROK_API_KEY",
            "desc": "High-intelligence reasoning models with real-time world knowledge and uncensored analytical capabilities.",
            "recommended": "grok-2-1212, grok-2-vision-1212",
            "links": [
                ("xAI API Console", "https://console.x.ai/", "Create API key & manage organization"),
                ("API Keys Portal", "https://console.x.ai/api-keys", "Generate xai- secret keys"),
                ("Billing & Credits", "https://console.x.ai/billing", "Add enterprise or credit balance"),
                ("xAI Documentation", "https://docs.x.ai/docs", "REST endpoints & completions specs"),
                ("Grok Models Overview", "https://docs.x.ai/docs/models", "Supported parameter sizes & pricing")
            ]
        },
        {
            "name": "6. Media & Creative AI Engines (Image & Voice Synthesis)",
            "env_var": "STABILITY_API_KEY / ELEVENLABS_API_KEY / REPLICATE_API_TOKEN",
            "desc": "High-fidelity text-to-image synthesis (SDXL, Stable Diffusion 3.5) and hyper-realistic AI voice cloning.",
            "recommended": "Stable Diffusion 3.5 Large, Eleven Multilingual v2, Flux.1 Schnell",
            "links": [
                ("Stability AI Platform", "https://platform.stability.ai/account/keys", "Generate API key for SD3.5 & SDXL"),
                ("ElevenLabs Voice AI", "https://elevenlabs.io/app/settings/api-keys", "Voice generation & realistic TTS keys"),
                ("Replicate Cloud", "https://replicate.com/account/api-tokens", "Run open-source Flux.1, Whisper, Llama"),
                ("Hugging Face Hub", "https://huggingface.co/settings/tokens", "Inference API access for community models")
            ]
        }
    ]

    for p_idx, prov in enumerate(providers):
        # Header block for each provider
        h_table_data = [
            [
                Paragraph(f"<b>{prov['name']}</b>", h1_style),
                Paragraph(f"Env: <b>{prov['env_var']}</b>", code_style)
            ]
        ]
        h_table = Table(h_table_data, colWidths=[334, 170])
        h_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,0), 'RIGHT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        
        table_rows = [
            [
                Paragraph("<b>Resource / Portal Name</b>", th_style),
                Paragraph("<b>Direct URL Link</b>", th_style),
                Paragraph("<b>Description & Purpose</b>", th_style)
            ]
        ]

        for title, url, desc in prov['links']:
            link_p = Paragraph(f'<a href="{url}" color="#0284c7"><u>{url}</u></a>', link_style)
            title_p = Paragraph(f"<b>{title}</b>", body_style)
            desc_p = Paragraph(desc, body_style)
            table_rows.append([title_p, link_p, desc_p])

        t = Table(table_rows, colWidths=[130, 204, 170])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284c7')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))

        desc_p = Paragraph(f"<b>Description:</b> {prov['desc']}<br/><b>Key Models:</b> {prov['recommended']}", body_style)
        
        provider_flow = KeepTogether([
            h_table,
            desc_p,
            Spacer(1, 4),
            t,
            Spacer(1, 12)
        ])
        story.append(provider_flow)

        if p_idx == 2:
            story.append(PageBreak())

    # Environment Setup Guide
    story.append(PageBreak())
    story.append(Paragraph("<b>Quick Setup Guide: Configuring server/.env in ZsyioGPT</b>", h1_style))
    story.append(Paragraph("Copy the template below into your <code>server/.env</code> file and paste your valid secret keys. Note that ZsyioGPT automatically trims stray whitespace and auto-routes OpenRouter keys to OpenRouter's gateway seamlessly.", body_style))
    story.append(Spacer(1, 8))

    env_content = (
        "# ==========================================\n"
        "# ZsyioGPT API Configuration (.env)\n"
        "# ==========================================\n"
        "PORT=5000\n"
        "NODE_ENV=development\n\n"
        "# 1. OpenAI or OpenRouter Key\n"
        "# Direct OpenAI format: sk-proj-...\n"
        "# OpenRouter format: sk-or-v1-...\n"
        "OPENAI_API_KEY=your_openai_or_openrouter_key_here\n"
        "OPENROUTER_API_KEY=your_openrouter_key_here\n\n"
        "# 2. Anthropic Claude (Format: sk-ant-api03-...)\n"
        "ANTHROPIC_API_KEY=your_anthropic_key_here\n"
        "CLAUDE_API_KEY=your_anthropic_key_here\n\n"
        "# 3. Google Gemini (Format: AIzaSy...)\n"
        "GEMINI_API_KEY=your_gemini_key_here\n\n"
        "# 4. xAI Grok (Format: xai-...)\n"
        "GROK_API_KEY=your_xai_grok_key_here\n\n"
        "# 5. Media & Voice Providers (Optional)\n"
        "STABILITY_API_KEY=your_stability_key_here\n"
        "ELEVENLABS_API_KEY=your_elevenlabs_key_here\n"
        "REPLICATE_API_TOKEN=your_replicate_token_here\n"
    )

    env_table = Table([[Paragraph(f"<pre>{env_content}</pre>", code_style)]], colWidths=[504])
    env_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(env_table)

    story.append(Spacer(1, 14))
    story.append(Paragraph("<b>Troubleshooting Common API Errors:</b>", h1_style))
    
    trouble_data = [
        [
            Paragraph("<b>Error Code / Message</b>", th_style),
            Paragraph("<b>Root Cause</b>", th_style),
            Paragraph("<b>Resolution in ZsyioGPT</b>", th_style)
        ],
        [
            Paragraph("<b>401 Incorrect API key provided</b>", body_style),
            Paragraph("An OpenRouter key (<code>sk-or-v1-</code>) was sent to OpenAI's endpoint, or key contains leading spaces.", body_style),
            Paragraph("Handled automatically! ZsyioGPT auto-detects <code>sk-or-</code> and redirects base URL to OpenRouter.", body_style)
        ],
        [
            Paragraph("<b>400 Credit balance is too low</b>", body_style),
            Paragraph("The provider account (e.g. Anthropic/OpenAI) has $0.00 credit balance.", body_style),
            Paragraph("Log in to the Billing portal linked above and add a $5 prepaid credit balance.", body_style)
        ],
        [
            Paragraph("<b>404 Model Not Found</b>", body_style),
            Paragraph("Model ID mismatch between direct provider and aggregator.", body_style),
            Paragraph("ZsyioGPT maps names like <code>gpt-4o-mini</code> to <code>openai/gpt-4o-mini</code> when using OpenRouter.", body_style)
        ],
        [
            Paragraph("<b>429 Rate Limit Reached</b>", body_style),
            Paragraph("Too many requests per minute for the current tier.", body_style),
            Paragraph("Upgrade tier or switch model to a lighter model (e.g. <code>gpt-4o-mini</code> or <code>gemini-2.0-flash</code>).", body_style)
        ]
    ]

    trouble_table = Table(trouble_data, colWidths=[130, 184, 190])
    trouble_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0369a1')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(trouble_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully created: {output_path}")

if __name__ == "__main__":
    out_pdf = r"d:\zsyio_gpt\urls.pdf"
    create_urls_pdf(out_pdf)
