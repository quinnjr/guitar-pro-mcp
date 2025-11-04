#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  getDefaultOutputDirectory,
  createGuitarProFile,
  createSimpleGuitarProFile,
} from './handlers/fileHandlers.js';

const server = new Server(
  {
    name: 'guitar-pro-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * List available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'config://output-directory',
        name: 'Default Output Directory',
        description: 'The default directory where Guitar Pro files will be saved',
        mimeType: 'text/plain',
      },
    ],
  };
});

/**
 * Read resource content
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'config://output-directory') {
    const defaultDir = getDefaultOutputDirectory();
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: defaultDir,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_guitar_pro_file',
        description:
          'Create a Guitar Pro 6 file with tablature data. Supports multiple tracks, measures, and notes. Files are saved to the Music folder by default.',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description:
                'Filename for the .gp6 file (e.g., "my-song.gp6"). Will be saved to the output directory.',
            },
            outputDirectory: {
              type: 'string',
              description:
                'Optional: Custom output directory path. If not provided, saves to the Music folder.',
            },
            title: {
              type: 'string',
              description: 'Song title',
            },
            artist: {
              type: 'string',
              description: 'Artist name (optional)',
            },
            tempo: {
              type: 'number',
              description: 'Tempo in BPM (default: 120)',
            },
            tracks: {
              type: 'array',
              description: 'Array of tracks (instruments)',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: 'Track name',
                  },
                  strings: {
                    type: 'number',
                    description: 'Number of strings (default: 6)',
                  },
                  tuning: {
                    type: 'array',
                    description:
                      'MIDI note values for each string (optional, defaults to standard guitar tuning)',
                    items: {
                      type: 'number',
                    },
                  },
                  measures: {
                    type: 'array',
                    description: 'Array of measures',
                    items: {
                      type: 'object',
                      properties: {
                        timeSignature: {
                          type: 'object',
                          description: 'Time signature (optional)',
                          properties: {
                            numerator: { type: 'number' },
                            denominator: { type: 'number' },
                          },
                        },
                        beats: {
                          type: 'array',
                          description: 'Array of beats',
                          items: {
                            type: 'object',
                            properties: {
                              duration: {
                                type: 'number',
                                description:
                                  'Note duration (1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth, 32=thirty-second)',
                              },
                              dotted: {
                                type: 'boolean',
                                description: 'Is the note dotted (optional)',
                              },
                              rest: {
                                type: 'boolean',
                                description: 'Is this a rest (optional)',
                              },
                              notes: {
                                type: 'array',
                                description: 'Array of notes',
                                items: {
                                  type: 'object',
                                  properties: {
                                    string: {
                                      type: 'number',
                                      description: 'String number (1-based)',
                                    },
                                    fret: {
                                      type: 'number',
                                      description: 'Fret number',
                                    },
                                    velocity: {
                                      type: 'number',
                                      description: 'Note velocity 0-127 (optional, default: 95)',
                                    },
                                  },
                                  required: ['string', 'fret'],
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                required: ['name', 'measures'],
              },
            },
          },
          required: ['filename', 'title', 'tracks'],
        },
      },
      {
        name: 'create_simple_guitar_pro_file',
        description:
          'Create a simple Guitar Pro 6 file with a single track and basic tablature. Great for quick prototyping. Files are saved to the Music folder by default.',
        inputSchema: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description:
                'Filename for the .gp6 file (e.g., "my-song.gp6"). Will be saved to the output directory.',
            },
            outputDirectory: {
              type: 'string',
              description:
                'Optional: Custom output directory path. If not provided, saves to the Music folder.',
            },
            title: {
              type: 'string',
              description: 'Song title',
            },
            artist: {
              type: 'string',
              description: 'Artist name (optional)',
            },
            tempo: {
              type: 'number',
              description: 'Tempo in BPM (default: 120)',
            },
            tablature: {
              type: 'array',
              description:
                'Array of tab strings like ["0-2-2", "3-3-3"] where each string represents a measure with format "fret-fret-fret" for string 1',
              items: {
                type: 'string',
              },
            },
          },
          required: ['filename', 'title', 'tablature'],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'create_guitar_pro_file') {
    return await handleCreateGuitarProFile(args);
  } else if (name === 'create_simple_guitar_pro_file') {
    return await handleCreateSimpleGuitarProFile(args);
  }

  throw new Error(`Unknown tool: ${name}`);
});

/**
 * Handle create_guitar_pro_file tool
 */
async function handleCreateGuitarProFile(args: Record<string, any>) {
  try {
    const { filepath, song } = await createGuitarProFile(args);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created Guitar Pro 6 file!\n\nLocation: ${filepath}\nTracks: ${song.tracks.length}\nMeasures: ${song.measureCount}\nTempo: ${song.tempo} BPM\n\nYou can now open this file in Guitar Pro 6 or later.`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error creating Guitar Pro file: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle create_simple_guitar_pro_file tool
 */
async function handleCreateSimpleGuitarProFile(args: Record<string, any>) {
  try {
    const { filepath, song } = await createSimpleGuitarProFile(args);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully created simple Guitar Pro 6 file!\n\nLocation: ${filepath}\nMeasures: ${song.measureCount}\nTempo: ${song.tempo} BPM\n\nYou can now open this file in Guitar Pro 6 or later.`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error creating simple Guitar Pro file: ${error}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Guitar Pro MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
