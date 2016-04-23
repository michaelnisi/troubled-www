# troubled-www - publish my site

**troubled-www** is an HTTP service I use to publish my [site](http://troubled.pro/).

This repo, probably not interesting to anyone but myself, contains the **troubled-www** [Node](https://nodejs.org) package, an HTTP API to generate and update a static site hosted on S3, and a setup script to run it on [SmartOS](https://smartos.org/) unwrapping TLS with [stud](https://github.com/bumptech/stud). Both, **troubled** and **stud**, managed by [SMF](https://illumos.org/man/5/smf).

The service subscribes to a [GitHub webhook](https://developer.github.com/webhooks/) to pull the master branch of the [source repo](https://github.com/michaelnisi/troubled). With these changes it generates a new version of the site, identifies the differing files, and copies them to an [Amazon S3](https://aws.amazon.com/s3/) bucket. The bucket is configured to host a [static website](http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html). The HTTP API is secured with [deed](https://github.com/michaelnisi/deed) using the `X-Hub-Signature` header.

Additionally, [cron](https://en.wikipedia.org/wiki/Cron) is setup to hit the `/update` endpoint every three hours to refresh my latest [tweet](https://twitter.com/michaelnisi) and [Instapaper](https://www.instapaper.com) likes, both displayed on the homepage. Here too, only changed files get copied to S3.

## Publishing the Site

### Request

```
POST /publish HTTP/1.1
```

### Response

```
HTTP/1.1 202 Accepted
Connection: close
Location: http://troubled.pro/
Content-Type: application/json
Content-Length: 11
Date: Thu, 14 Apr 2016 07:01:12 GMT

{
  "ok": true
}
```

## Updating Tweet and Likes

### Request

```
GET /update HTTP/1.1
```

### Response

```
HTTP/1.1 202 Accepted
Connection: close
Location: http://troubled.pro/
Content-Type: application/json
Content-Length: 11
Date: Thu, 14 Apr 2016 06:59:55 GMT

{
  "ok": true
}
```

## Installing the Service

Memory might get tight—Node processes are colossal—but lets install on the smallest [Triton Standard Instance](https://www.joyent.com/public-cloud/pricing).

This is a Node program, so:

```
$ pkgin -y in nodejs-5.7.0
```

The service depends on Git and stud:

```
$ pkgin -y in git-base-2.7.3
$ pkgin -y in stud-0.3p53nb5
```

Remember to configure Git properly, it requires `user.name` and `user.email` to pull, add, and commit. See `git-config(1)`.

Unfortunately, we need GCC and Make to build:

```
$ pkgin -y in gcc47-4.7.4
$ pkgin -y in gmake-4.1nb1
```

Lets get the code and build a release.

```
$ git clone https://github.com/michaelnisi/troubled-www.git
$ cd troubled-www
$ make
```

We need a [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security) certificate for stud.

The Joyent pkgsrc [repo](http://pkgsrc.joyent.com/) offers  a [Let's Encrypt](https://letsencrypt.org/) client to automatically receive and instal X.509 certificates.

```
$ pkgin se letsencrypt
```

To use a self-signed certificate instead, you might do:

```
$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout key.pem -out certs.pem \
    -subj "/C=$COUNTRY/S=$STATE/O=$ORG/OU=$UNIT/CN=$NAME"
```

If you're using a self-signed certificate—asking for [MITM attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)—you have to deactivate certificate verification in your GitHub web hook setting.

Concatenate certificate with private key and put everything into place:

```
$ cat key.pem >> certs.pem
$ mv certs.pem /opt/local/etc/stud/certs.pem
$ cp -r build/troubled /opt/troubled
```

This last step, running the setup script which also starts the service, uses environment variables, make sure to export them first.

```
$ ./opt/troubled/boot/setup.sh
```

## License

See [LICENSE](https://raw.github.com/michaelnisi/troubled-www/master/LICENSE)
