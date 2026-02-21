"use client";

import { Alert, Badge, Card, Text } from "@/components/retroui";
import { useMDXComponent } from "@content-collections/mdx/react";
import React, { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import Link from "next/link";
import { CliCommand } from "./ComponentInstall";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Table } from "./retroui/Table";

const components = (type: "doc" | "blog") => ({
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Text as="h1" className="mt-10 mb-4 [&:first-child]:mt-0" {...props} />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) =>
    type === "blog" ? (
      <Text as="h2" className="mt-10 mb-4 [&:first-child]:mt-0" {...props} />
    ) : (
      <Text
        as="h2"
        className="border-b pb-1 mt-10 mb-6 [&:first-child]:mt-0"
        {...props}
      />
    ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Text as="h3" className="mt-8 mb-3 [&:first-child]:mt-0" {...props} />
  ),
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Text as="h4" className="mt-6 mb-2 [&:first-child]:mt-0" {...props} />
  ),
  h5: (props: HTMLAttributes<HTMLHeadElement>) => (
    <Text as="h5" className="mt-4 mb-1 [&:first-child]:mt-0" {...props} />
  ),
  h6: (props: HTMLAttributes<HTMLHeadElement>) => (
    <Text as="h6" className="mt-4 mb-1 [&:first-child]:mt-0" {...props} />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) =>
    type === "blog" ? (
      <Text
        className="mb-4 text-lg text-foreground leading-relaxed"
        {...props}
      />
    ) : (
      <Text className="mb-4 leading-relaxed" {...props} />
    ),
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-4 ml-6 list-disc space-y-1.5" {...props} />
  ),
  ol: (props: HTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1.5" {...props} />
  ),
  // MDX produces two modes for list items:
  // - tight list: children is plain text/inline
  // - loose list (blank lines between items): children wrapped in <p> tags
  // We handle both — the p inside li already has mb-4, so we suppress it
  // on the last child to avoid double spacing.
  li: ({ className, ...props }: HTMLAttributes<HTMLLIElement>) => (
    <li
      className={cn(
        "leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0",
        className,
      )}
      {...props}
    />
  ),
  blockquote: (props: HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-primary pl-4 my-6 text-muted-foreground italic"
      {...props}
    />
  ),
  hr: (props: HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-8 border-t-2 border-border" {...props} />
  ),
  img: (props: HTMLAttributes<HTMLImageElement>) => (
    <img className="mx-auto w-full max-w-[600px] my-8" {...props} />
  ),
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const { href, target, rel, ...rest } = props;

    if (!href) {
      return <a {...rest} />;
    }

    const isExternal = href.startsWith("http");

    return isExternal ? (
      <a
        href={href}
        target={target || "_blank"}
        rel={rel || "noopener noreferrer"}
        className="underline underline-offset-4 hover:decoration-primary"
        {...rest}
      />
    ) : (
      <Link
        href={href}
        className="underline underline-offset-4 hover:decoration-primary"
        {...rest}
      />
    );
  },
  pre: CodeBlock,
  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded-(--radius) bg-[#282A36] p-1 text-primary text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  ),
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Link,
  Badge,
  Image,
  Card,
  Alert,
  CliCommand,
});

export default function MDX({
  code,
  type = "doc",
}: {
  code: string;
  type?: "doc" | "blog";
}) {
  const Content = useMDXComponent(code);

  return <Content components={components(type)} />;
}
