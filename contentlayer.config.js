import { defineDocumentType, makeSource } from "contentlayer/source-files";
import remarkGfm from "./util/remark-gfm-safe.js";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const prettyCodeOptions = {
	theme: {
		dark: "github-dark",
		light: "github-light",
	},
	onVisitLine(node) {
		if (!node.children || node.children.length === 0) {
			node.children = [{ type: "text", value: " " }];
		}
	},
	onVisitHighlightedLine(node) {
		node.properties = node.properties ?? {};
		node.properties.className = [
			...(node.properties.className ?? []),
			"line--highlighted",
		];
	},
	onVisitHighlightedWord(node) {
		node.properties = node.properties ?? {};
		node.properties.className = ["word--highlighted"];
	},
};

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields = {
	path: {
		type: "string",
		resolve: (doc) => `/${doc._raw.flattenedPath}`,
	},
	slug: {
		type: "string",
		resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
	},
};

export const Project = defineDocumentType(() => ({
	name: "Project",
	filePathPattern: "./projects/**/*.mdx",
	contentType: "mdx",

	fields: {
		published: {
			type: "boolean",
		},
		title: {
			type: "string",
			required: true,
		},
		description: {
			type: "string",
			required: true,
		},
		date: {
			type: "date",
		},
		url: {
			type: "string",
		},
		repository: {
			type: "string",
		},
		skills: {
			type: "string",
			required: true
		}
	},
	computedFields,
}));

export const Page = defineDocumentType(() => ({
	name: "Page",
	filePathPattern: "pages/**/*.mdx",
	contentType: "mdx",
	fields: {
		title: {
			type: "string",
			required: true,
		},
		description: {
			type: "string",
		},
	},
	computedFields,
}));

export default makeSource({
	contentDirPath: "./content",
	documentTypes: [Project],
	mdx: {
		remarkPlugins: [remarkGfm],
		rehypePlugins: [
			[rehypePrettyCode, prettyCodeOptions],
			rehypeSlug,
			[
				rehypeAutolinkHeadings,
				{
					properties: {
						className: ["subheading-anchor"],
						ariaLabel: "Link to section",
					},
				},
			],
		],
	},
});
